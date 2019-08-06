import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { getSearch, setSearch } from 'common/tools';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {withAppState} from '../../../../common/appStateStore';
import Title from '../../../../common/TitleComponent';

@observer
class Account extends React.Component<any, any> {
    private tableRef: TableList;

    @observable private visible: boolean = false;
    @observable private editId: string = '';
    @observable private loading: boolean = false;
    @observable private roleInfo: [{ label: string, value: string }];
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        mutate<{}, any>({
            url: '/api/admin/account/allroles',
            method: 'get',
            // variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                this.roleInfo = r.data;
            }
        });
    }
    add() {
        this.editId = '';
        this.visible = true;
    }
    edit(data: any) {
        this.editId = data.id;
        this.visible = true;
        this.props.form.setFieldsValue({
            mobile: data.mobile,
            role_id: data.role_id,
            remark: data.remark,
        });
    }
    banSave(data: any) {
        const json = {
            status: +data.status === 1 ? 2 : 1,
        };
        mutate<{}, any>({
            url: '/api/admin/account/users/' + data.id,
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
                let method = 'post';
                let url = '/api/admin/account/users';
                if (this.editId !== '') {
                    json['id'] = this.editId;
                    method = 'put';
                    url = '/api/admin/account/users/' + this.editId + '/edit';
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
    beforeRequest(data: any) {
        setSearch(this.props.data.appState.panes, this.props.data.appState.activePane, Object.assign({}, data));
        return data;
    }
    render() {
        const that: any = this;
        const jurisdiction: number[] = this.props.data.appState.jurisdiction || [];
        const columns = [
            { title: '用户备注', key: 'remark', dataIndex: 'remark' },
            { title: '手机号', key: 'mobile', dataIndex: 'mobile' },
            { title: '角色名称', key: 'role_name', dataIndex: 'role_name', render: (data: any, record: any) =>  record.is_admin === 1 ? '主账号' : data },
            { title: '状态', key: 'status_text', dataIndex: 'status_text' },
            { title: '创建时间', key: 'created_at', dataIndex: 'created_at' },
            {
                title: '操作', key: 'edit', render(data: any) {
                    return (
                        data.is_admin === 1
                        ?
                        ''
                        :
                        <div>
                            {
                                jurisdiction.indexOf(30) > -1 ? <a style={{marginRight: '10px'}}
                                                                 onClick={() => that.banSave(data)}>{+data.status === 1 ? '禁用' : '启用'}</a> : null
                            }
                            {
                                jurisdiction.indexOf(31) > -1 ? <a onClick={() => that.edit(data)}>编辑</a> : null
                            }
                        </div>);
                },
            },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '用户备注', hasFeedback: false }, typeComponentProps: { placeholder: '用户备注' }, key: 'remark', type: 'input' },
            {
                itemProps: { label: '状态', hasFeedback: false }, key: 'status', type: 'select', options: [
                    { label: '全部', value: '-1' },
                    { label: '启用', value: '1' },
                    { label: '禁用', value: '2' },
                ],
            },
        ];
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            {
                key: 'mobile', type: 'input', itemProps: { label: '手机号' },
                required: true,
                typeComponentProps: {
                    disabled: this.editId ? true : false,
                },
                fieldDecoratorOptions: {
                    rules: [{ pattern: /^1[0-9]{10}$/, message: '手机号填写有误' }, { required: true, message: '请输入手机号' }],
                },
            },
            { key: 'role_id', type: 'select', itemProps: { label: '角色权限' }, required: true, options: this.roleInfo },
            { key: 'remark', type: 'input', itemProps: { label: '用户备注' }, required: true },
        ];
        return (
            <Title>
                <SearchTable
                    wrappedComponentRef={(ref: TableList) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/account/users'
                    tableProps={{ columns }}
                    query={{ search }}
                    autoSearch={getSearch(this.props.data.appState.panes, this.props.data.appState.activePane)}
                    beforeRequest={(data: any) => this.beforeRequest(data)}
                    otherComponent={jurisdiction.indexOf(32) > -1 ? <Button type='primary' onClick={() => this.add()}>新建账号</Button> : null}
                />
                <Modal
                    forceRender
                    visible={this.visible}
                    title={this.editId ? '编辑账户' : '新增账户'}
                    onOk={() => this.submit()}
                    onCancel={() => { this.visible = false; this.props.form.resetFields(); }}
                >
                    <BaseForm form={this.props.form} item={formItem} />
                </Modal>
            </Title>
        );
    }
}
const ExportViewCom: any = Form.create()(Account);
export default withAppState(ExportViewCom);
