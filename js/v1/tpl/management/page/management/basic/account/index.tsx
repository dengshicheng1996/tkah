import { TableProps } from 'antd/lib/table/interface';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
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
    }
    banSave(data: any) {
        console.log(data);
    }
    submit() {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);

                if (this.editId !== '') {
                    json['id'] = this.editId;
                }
                mutate<{}, any>({
                    url: '/api/admin/account/users',
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

    render() {
        const that: any = this;
        const columns = [
            { title: '用户备注', key: 'remark', dataIndex: 'remark' },
            { title: '手机号', key: 'mobile', dataIndex: 'mobile' },
            { title: '角色名称', key: 'role_name', dataIndex: 'role_name' },
            { title: '状态', key: 'status', dataIndex: 'status', render(status: number | string) { return +status === 1 ? '已启用' : '已禁用'; } },
            { title: '创建时间', key: 'created_at', dataIndex: 'created_at' },
            {
                title: '操作', key: 'edit', render(data: any) {
                    return (<div>
                        {
                            +data.status === 1 ? <a style={{ marginRight: '10px' }} onClick={() => that.banSave(data)}>禁用</a> : null
                        }
                        <a onClick={() => that.edit(data)}>编辑</a>
                    </div>);
                },
            },
        ];
        const search: BaseFormItem[] = [
            { itemProps: { label: '用户备注', hasFeedback: false }, typeComponentProps: { placeholder: '用户备注' }, key: 'name', type: 'input' },
            {
                itemProps: { label: '角色权限', hasFeedback: false }, key: 'status', type: 'select', options: [
                    { label: '全部', value: '-1' },
                    { label: '启用', value: '1' },
                    { label: '禁用', value: '2' },
                ],
            },
        ];
        const formItem: BaseFormItem[] = [
            { key: 'mobile', type: 'input', itemProps: { label: '手机号' } },
            { key: 'role_id', type: 'select', itemProps: { label: '角色权限' }, options: this.roleInfo },
            { key: 'remark', type: 'input', itemProps: { label: '用户备注' } },
        ];
        return (
            <Title>
                <SearchTable
                    wrappedComponentRef={(ref) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/account/users'
                    tableProps={{ columns }}
                    query={{ search }}
                    otherComponent={<Button type='primary' onClick={() => this.add()}>新建账号</Button>}
                />
                <Modal
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
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;
