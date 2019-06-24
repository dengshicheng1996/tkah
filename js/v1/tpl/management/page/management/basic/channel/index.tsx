import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { Upload } from 'common/antd/upload';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import UploadComponent from 'common/component/UploadComponent';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import {objectToOption} from 'common/tools';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import Title from '../../../../common/TitleComponent';
import {withAppState} from "../../../../common/appStateStore";
interface ChnnelPropsType {
    form: WrappedFormUtils;
    data: any;
}
@observer
class Channel extends React.Component<ChnnelPropsType, any> {
    private tableRef: TableList;

    @observable private editId: any = '';
    @observable private visible: boolean = false;
    @observable private loading: boolean = false;
    @observable private first_risk_model: any[] = [{ label: 'test', value: 2 }];
    @observable private other_risk_model: any[] = [{ label: 'test', value: 2 }];
    @observable private risk_model: any[] = [];
    @observable private imgUrl: string = '';
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        mutate<{}, any>({
            url: '/api/admin/riskflow/flow',
            method: 'get',
        }).then(r => {
            if (r.status_code === 200) {
                this.risk_model = r.data.data;
                const arr = objectToOption(r.data.data, {valueKey: 'flow_no', labelKey: 'name'});
                this.first_risk_model = arr;
                this.other_risk_model = arr;
            }
        });
    }
    add() {
        this.editId = '';
        this.visible = true;
        this.imgUrl = '';
        this.props.form.resetFields();
    }
    edit(data: any) {
        this.editId = data.id;
        this.visible = true;
        this.props.form.setFieldsValue({ bg_pic: data.bg_pic, name: data.name, first_risk_model: +data.first_risk_model, two_risk_model: +data.two_risk_model, scrol_text: data.scrol_text });
        this.imgUrl = data.bg_pic;
    }
    banSave(data: any) {
        const json = {
            status: +data.status === 1 ? 2 : 1,
        };
        mutate<{}, any>({
            url: '/api/admin/basicconfig/channels/' + data.id,
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
    refreshPassword(data: any) {
        const json = {
            status: +data.status === 1 ? 2 : 1,
        };
        mutate<{}, any>({
            url: '/api/admin/basicconfig/channels/' + data.id,
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
    getName(id: number) {
        let name = '';
        this.risk_model.map((item: any) => {
            if (item.flow_no === id) {
                name = item.name;
            }
        });
        return name;
    }
    submit() {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                json.first_risk_model_name = this.getName(json.first_risk_model);
                json.two_risk_model_name = this.getName(json.two_risk_model);
                let method = 'post';
                let url = '/api/admin/basicconfig/channels';
                json.bg_pic = this.imgUrl;
                if (this.editId !== '') {
                    method = 'put';
                    url = '/api/admin/basicconfig/channels/' + this.editId + '/edit';
                }
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
    render() {
        const that = this;
        const jurisdiction: any = this.props.data.appState.jurisdiction || [];
        const columns = [
            { title: '渠道名称', dataIndex: 'name' },
            {
                title: '推广地址', dataIndex: 'invite_url', width: '300px', render(data: string) {
                    return <div style={{ width: 300, wordWrap: 'break-word' }}>{data}</div>;
                },
            },
            { title: '查看数据地址', dataIndex: 'see_data_url' },
            { title: '查看数据密码', dataIndex: 'see_data_password' },
            { title: '首借风控流', dataIndex: 'first_risk_model_name' },
            { title: '续借风控流', dataIndex: 'two_risk_model_name' },
            {
                title: '状态', dataIndex: 'status', render(data: number | string) {
                    return +data === 1 ? '启用' : '禁用';
                },
            },
            {
                title: '操作', render(data: any) {
                    return (<div>
                        {
                            jurisdiction.indexOf(29) > -1 ? <a style={{marginRight: '10px'}} onClick={() => that.banSave(data)}>{+data.status === 1 ? '禁用' : '启用'}</a> : null

                        }
                        {
                            jurisdiction.indexOf(28) > -1 ? <a style = {{marginRight: '10px'}} onClick={() => that.edit(data)}>编辑</a> : null
                        }
                        {/*<a onClick={() => that.refreshPassword(data)}>刷新密码</a>*/}
                    </div>);
                },
            },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '渠道名称' }, key: 'name', type: 'input' },
            {
                itemProps: { label: '状态' }, key: 'status', type: 'select', options: [
                    { label: '全部', value: '-1' },
                    { label: '启用', value: '1' },
                    { label: '禁用', value: '2' },
                ],
            },
        ];
        const uploadImg = <div>
            {
                this.imgUrl && <img style={{ width: 200, height: 100, marginBottom: 10 }} src={this.imgUrl} />
            }
            <UploadComponent accept={'image/*'} complete={(url: string) => this.imgUrl = url} />
        </div>;
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { key: 'name', type: 'input', itemProps: { label: '渠道名称' }, required: true },
            { key: 'bg_pic', type: 'select', itemProps: { label: '背景图', hasFeedback: false }, required: true, component: uploadImg },
            { key: 'scrol_text', type: 'input', itemProps: { label: '滚动信息' }, required: true, component: <Input.TextArea /> },
            { key: 'first_risk_model', type: 'select', itemProps: { label: '首借风控流' }, required: true, options: this.first_risk_model },
            { key: 'two_risk_model', type: 'select', itemProps: { label: '续借风控流' }, required: true, options: this.other_risk_model },
        ];
        return (
            <Title>
                <Modal
                    visible={this.visible}
                    title={this.editId ? '编辑渠道' : '新增渠道'}
                    forceRender
                    onOk={() => this.submit()}
                    onCancel={() => { this.visible = false; this.props.form.resetFields(); }}
                >
                    <Spin spinning={this.loading}>
                        <BaseForm form={this.props.form} item={formItem} />
                    </Spin>
                </Modal>
                <SearchTable
                    wrappedComponentRef={(ref: TableList) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/basicconfig/channels'
                    tableProps={{ columns }}
                    query={{ search }}
                    otherComponent={jurisdiction.indexOf(27) > -1 ? <Button type='primary' onClick={() => that.add()}>新建渠道</Button> : null} />
            </Title>
        );
    }

}
const ExportViewCom: any = Form.create()(Channel);
export default withAppState(ExportViewCom);
