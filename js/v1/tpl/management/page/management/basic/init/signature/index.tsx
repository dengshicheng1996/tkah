import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { BaseForm } from 'common/formTpl/baseForm';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

interface ChnnelPropsType {
    form: any;
}
@observer
class Channel extends React.Component<ChnnelPropsType, any> {
    private tableRef: TableList;

    @observable private editId: any = '';
    @observable private visible: boolean = false;
    @observable private loading: boolean = false;
    @observable private risk_model: any[] = [{ label: 'test', value: 2 }];
    @observable private formItem: any[] = [
        { key: 'capitalists_type', type: 'select', label: '签章类型', initialValue: 1, onChange: (type: any) => this.typeChange(type), options: [{ value: 2, label: '公司签章' }, { value: 1, label: '个人签章' }] },
        { key: 'name', type: 'input', label: '姓名', options: this.risk_model },
        { key: 'legal_person_id_number', type: 'input', label: '身份证号', options: this.risk_model },
        { key: 'legal_person_phone', type: 'input', label: '手机号', options: this.risk_model },
    ];
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        // mutate<{}, any>({
        //     url: '/api/admin/account/allroles',
        //     method: 'get',
        //     // variables: json,
        // }).then(r => {
        //     if (r.status_code === 200) {
        //         this.risk_model = r.data;
        //     }
        // });
    }
    add() {
        this.editId = '';
        this.visible = true;
    }
    edit(data: any) {
        this.editId = data.id;
        this.visible = true;
    }
    banSave(data: any) {
        const json = {
            status: +data.status === 1 ? 2 : 1,
        };
        mutate<{}, any>({
            url: '/api/admin/basicconfig/capitalists/' + data.id,
            method: 'put',
            variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                message.success('操作成功');
                this.tableRef.getQuery().refresh();
            } else {
                message.error(r.message);
            }
        });
    }
    submit() {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                mutate<{}, any>({
                    url: '/api/admin/basicconfig/capitalists',
                    method: 'post',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.success('操作成功');
                        this.visible = false;
                        this.tableRef.getQuery().refresh();
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
    typeChange(data: any) {
        if (!data) {
            this.formItem = [
                { key: 'capitalists_type', type: 'select', label: '签章类型', onChange: (type: any) => this.typeChange(type), options: [{ value: 2, label: '公司签章' }, { value: 1, label: '个人签章' }] },
            ];
        }
        if (+data === 1) {
            this.formItem = [
                { key: 'capitalists_type', type: 'select', label: '签章类型', onChange: (type: any) => this.typeChange(type), options: [{ value: 2, label: '公司签章' }, { value: 1, label: '个人签章' }] },
                { key: 'name', type: 'input', label: '姓名', options: this.risk_model },
                { key: 'legal_person_id_number', type: 'input', label: '身份证号', options: this.risk_model },
                { key: 'legal_person_phone', type: 'input', label: '手机号', options: this.risk_model },
            ];
        } else {
            this.formItem = [
                { key: 'capitalists_type', type: 'select', label: '签章类型', onChange: (type: any) => this.typeChange(type), options: [{ value: 2, label: '公司签章' }, { value: 1, label: '个人签章' }] },
                { key: 'company_name', type: 'input', label: '公司名称' },
                { key: 'unified_social_credit_code', type: 'input', label: '统一社会信用代码' },
                { key: 'legal_person_name', type: 'input', label: '联系人姓名' },
                { key: 'legal_person_id_number', type: 'input', label: '联系人身份证号' },
                { key: 'legal_person_phone', type: 'input', label: '联系人手机号' },
            ];
        }
    }
    render() {
        const that = this;
        const columns = [
            { title: '签章唯一标识', dataIndex: 'id' },
            {
                title: '签章类型', key: 'capitalists_type', dataIndex: 'capitalists_type', width: '300px', render(data: string) {
                    return +data === 1 ? '个人' : '公司';
                },
            },
            {
                title: '名称', dataIndex: 'name',
            },
            {
                title: '姓名', key: 'legal_person_name', render(data: any) {
                    return +data.capitalists_type === 1 ? data.legal_person_name : data.company_name;
                },
            },
            { title: '联系人身份证号', dataIndex: 'legal_person_id_number' },
            { title: '联系人手机号', dataIndex: 'legal_person_phone' },
            {
                title: '签章类型', dataIndex: 'capitalists_type', width: '300px', render(data: string) {
                    return +data === 1 ? '个人' : '公司';
                },
            },
            { title: '统一社会信用代码', dataIndex: 'unified_social_credit_code' },
            {
                title: '状态', dataIndex: 'status', render(data: number | string) {
                    return +data === 1 ? '启用' : '禁用';
                },
            },
            {
                title: '操作', render(data: any) {
                    return (<div>
                        <a style={{ marginRight: '10px' }}
                            onClick={() => that.banSave(data)}>{+data.status === 1 ? '禁用' : '启用'}</a>
                    </div>);
                },
            },
        ];
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 10 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 12 },
            },
        };
        return (
            <div>
                <Modal
                    visible={this.visible}
                    title={this.editId ? '编辑签章' : '新增签章'}
                    width={1200}
                    onOk={() => this.submit()}
                    onCancel={() => { this.visible = false; this.props.form.resetFields(); }}
                >
                    <Spin spinning={this.loading}>
                        <BaseForm col={3} formItemLayout={formItemLayout} form={this.props.form} item={this.formItem} />
                    </Spin>
                </Modal>
                <SearchTable
                    ref={(ref) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/basicconfig/capitalists'
                    tableProps={{ columns }}
                    otherComponent={<Button type='primary' onClick={() => that.add()}>新建签章</Button>} />
            </div>
        );
    }

}
const ExportViewCom = Form.create()(Channel);
export default ExportViewCom;
