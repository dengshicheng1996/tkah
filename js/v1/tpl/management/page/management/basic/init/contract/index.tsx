import { Button } from 'common/antd/button';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Popconfirm } from 'common/antd/popconfirm';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import UploadComponent from 'common/component/UploadComponent';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { getSeparator } from 'common/tools';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import AddComponent from '../signature/addSignature';
const Option = Select.Option;
@observer
class Product extends React.Component<any, any> {
    private tableRef: TableList;
    @observable private visible: boolean = false;
    @observable private addVisible: boolean = false;
    @observable private editId: string = '';
    @observable private fileUrl: string = '';
    @observable private setFields: any[] = [{ page: '', X: '', Y: '', signature: 0 }];
    @observable private signatureInfo: any[] = [];
    @observable private loading: boolean = false;
    constructor(props: any) {
        super(props);
    }
    getSignatureInfo() {
        mutate<{}, any>({
            url: '/api/admin/basicconfig/getCapitalistsAll',
            method: 'get',
        }).then(r => {
            this.signatureInfo = r.data;
        });
    }
    componentDidMount() {
        this.getSignatureInfo();
    }
    edit(data: any) {
        this.editId = data.id;
        this.visible = true;
        mutate<{}, any>({
            url: '/api/admin/basicconfig/contractconfig/' + data.id,
            method: 'get',
        }).then(r => {
            const { contract_type, name, contract_file_url } = r.data;
            this.props.form.setFieldsValue({ contract_type, name, contract_file_url });
            this.fileUrl = contract_file_url;
            this.setFields = r.data.items.map((it: any) => {
                const capitalists_name = this.getName(it.capitalists_id);
                return {
                    signature: (!capitalists_name && it.capitalists_name) ? it.capitalists_name : (capitalists_name + getSeparator() + it.capitalists_id) ,
                    capitalists_id: it.capitalists_id, // 保存原来的ID，禁用状态下选择框里没有这个资方，如果不做修改要将这个ID传回去。
                    X: it.coordinate_x,
                    Y: it.coordinate_y,
                    page: it.page,
                };
            });
        });
    }
    getName(id: string | number) {
        let name: string|undefined;
        this.signatureInfo.map((item: any) => {
            if (+item.id === +id) {
                name = item.name;
            }
        });
        return name;
    }
    submit() {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                json.contract_file_url = this.fileUrl;
                json.items = this.setFields.map((it: any) => {
                    const arr: any[] = it.signature.split(getSeparator()) || [];
                    const capitalists_id: string|number = arr.length > 1 ? arr[1] : it.capitalists_id;
                    const capitalists_name = this.getName(capitalists_id);
                    return {
                        capitalists_id,
                        capitalists_name: capitalists_name || it.signature,
                        coordinate_x: it.X,
                        coordinate_y: it.Y,
                        page: it.page };
                });
                const url = this.editId ? '/api/admin/basicconfig/contractconfig' + '/' + this.editId : '/api/admin/basicconfig/contractconfig';
                const method = this.editId ? 'put' : 'post';
                mutate<{}, any>({
                    url,
                    method,
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.success('操作成功');
                        this.visible = false;
                        this.tableRef.getQuery().refresh();
                        this.setFields = [{ page: '', X: '', Y: '', signature: '' }];
                        this.fileUrl = '';
                        this.props.form.resetFields();
                    } else {
                        message.error(r.message);
                    }
                }, error => {
                    this.loading = false;
                    Modal.error({
                        title: '警告',
                        content: `Error: ${JSON.stringify(error)}`,
                    });
                });
            }
        });
    }
    add() {
        this.editId = '';
        this.visible = true;
        this.setFields = [{ page: '', X: '', Y: '', signature: '', first: true }];
    }
    delete(data: any) {
        mutate<{}, any>({
            url: '/api/admin/basicconfig/contractconfig/' + data.id,
            method: 'delete',
            // variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                this.tableRef.getQuery().refresh();
            }
        });
    }
    uploadComponent() {
        return <div>
            {
                this.fileUrl ? <a download target='_blank' style={{ marginRight: '10px' }} href={this.fileUrl}>查看文件</a> : null
            }
            <UploadComponent fileType={['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']} complete={(url: string) => this.fileUrl = url} />
        </div>;
    }
    setComponent() {
        const col1 = 4;
        const col2 = 4;
        const col3 = 4;
        const col4 = 6;
        const col5 = 6;
        return (
            <div>
                <Row style={{ textAlign: 'center' }}>
                    <Col span={col1}>页数</Col>
                    <Col span={col2}>X轴坐标</Col>
                    <Col span={col3}>Y轴坐标</Col>
                    <Col span={col4}>签章</Col>
                    <Col span={col5}><a style={{ marginLeft: '5px' }} onClick={() => this.addVisible = true}>新增签章</a></Col>
                </Row>
                {
                    this.setFields.map((item: any, index: number) => (
                        <Row key={index} style={{ textAlign: 'center' }}>
                            <Col span={col1}><Input style={{ width: '80px' }} onChange={(e: any) => this.setFields[index].page = e.target.value} value={this.setFields[index].page} /></Col>
                            <Col span={col2}><Input style={{ width: '80px' }} onChange={(e: any) => this.setFields[index].X = e.target.value} value={this.setFields[index].X} /></Col>
                            <Col span={col3}><Input style={{ width: '80px' }} onChange={(e: any) => this.setFields[index].Y = e.target.value} value={this.setFields[index].Y} /></Col>
                            <Col span={col4}>
                                {
                                    index === 0 ? '借款人'
                                        :
                                        <Select showSearch style={{ width: '130px' }} value={this.setFields[index].signature} onChange={(data: any) => this.setFields[index].signature = data}>
                                            {
                                                this.signatureInfo.map((it: any, ind: number) => <Option key={ind} value={it.name + getSeparator() + it.id}>{it.name}</Option>)
                                            }
                                        </Select>
                                }
                            </Col>
                            <Col span={col4}>
                                {index > 0 && <Button onClick={() => this.setFields.splice(index, 1)}>删除</Button>}
                            </Col>
                        </Row>
                    ),
                    )
                }
                <div>
                    <a style={{marginLeft: '15px'}} onClick={() => this.setFields.push({
                        page: '',
                        X: '',
                        Y: '',
                        signature: '',
                    })}>新增签署方</a>
                </div>
            </div>
        );
    }
    render() {
        const that = this;
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { key: 'name', type: 'input', itemProps: { label: '合同名称' }, required: true },
            { key: 'contract_file_url', type: 'select', itemProps: { label: '合同文件', hasFeedback: false }, required: true, component: this.uploadComponent() },
            { key: 'contract_type', type: 'select', itemProps: { label: '合同类型' }, required: true, options: [{ label: '借款合同', value: 1 }, { label: '授权合同', value: 2 }, { label: '展期合同', value: 3 }] },
            { key: 'items', type: 'select', itemProps: { label: '签署配置', hasFeedback: false }, component: this.setComponent() },
        ];
        const columns = [
            { title: '合同编号', dataIndex: 'id' },
            { title: '合同名称', dataIndex: 'name' },
            { title: '合同类型', dataIndex: 'contract_type_text' },
            { title: '创建时间', dataIndex: 'created_at' },
            {
                title: '操作', key: 'set', render: (data: any) =>
                    (<div>
                        <a style={{ marginRight: '15px' }} onClick={() => that.edit(data)}>编辑</a>
                        <Popconfirm onConfirm={() => that.delete(data)} title='确定删除此合同？' okText='确定' cancelText='取消'>
                            <a href='javascript:;'>删除</a>
                        </Popconfirm>
                    </div>),
            },
        ];
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        return (
            <div>
                <AddComponent
                    onCancel={() => this.addVisible = false}
                    onOk={() => {this.addVisible = false; this.getSignatureInfo(); }}
                    visible={this.addVisible}
                />
                <Modal
                    width={1000}
                    visible={this.visible}
                    title={this.editId ? '编辑合同' : '新增合同'}
                    onOk={() => this.submit()}
                    onCancel={() => { this.visible = false; this.props.form.resetFields(); }}
                >
                    <BaseForm formItemLayout={formItemLayout} form={this.props.form} item={formItem} />
                </Modal>
                <SearchTable
                    wrappedComponentRef={(ref: TableList) => { this.tableRef = ref; }}
                    requestUrl={'/api/admin/basicconfig/contractconfig/'}
                    tableProps={{ columns }}
                    otherComponent={<Button type='primary' onClick={() => this.add()}>新建合同</Button>}
                />
            </div>
        );
    }
}
const ExportViewCom = Form.create()(Product);
export default ExportViewCom;
