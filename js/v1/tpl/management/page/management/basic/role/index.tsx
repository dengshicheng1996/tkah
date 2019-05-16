import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Tag } from 'common/antd/tag';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import { observable, toJS, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import Title from '../../../../common/TitleComponent';
@observer
class RoleView extends React.Component<any, any> {
    private tableRef: TableList;

    @observable private visible: boolean = false;
    @observable private editId: string = '';
    @observable private loading: boolean = false;

    constructor(props: any) {
        super(props);
    }

    banSave = (data: any) => {
        const json = {
            status: +data.status === 1 ? 2 : 1,
        };
        mutate<{}, any>({
            url: '/api/admin/account/roles/' + data.id,
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

    edit(data: any) {
        this.editId = data.id;
        this.visible = true;
    }

    add() {
        this.editId = '';
        this.visible = true;
    }

    submit() {
        console.log(123);
    }

    render() {
        const that: any = this;
        const columns = [
            { title: '角色名称', dataIndex: 'role_name' },
            {
                title: '状态',
                width: '15%',
                dataIndex: 'status_text',
                render: (text: any, record: any) => {
                    return (
                        <Tag color={record.status === 1 ? 'blue' : 'red'}>{text}</Tag>
                    );
                },
            },
            { title: '创建时间', dataIndex: 'created_at' },
            {
                title: '操作', dataIndex: 'status', render(status: number, record: any) {
                    return (<div>
                        <a style={{ marginRight: '10px', color: status === 1 ? 'red' : 'blue' }} onClick={() => that.banSave(record)}>
                            {+status === 1 ? '禁用' : '启用'}
                        </a>
                        <a onClick={() => that.edit(record)}>编辑</a>
                    </div>);
                },
            },
        ];
        const formItem: BaseFormItem[] = [
            { key: 'mobile', type: 'input', itemProps: { label: '手机号' } },
            { key: 'remark', type: 'input', itemProps: { label: '用户备注' } },
        ];
        return (
            <Title>
                <SearchTable
                    wrappedComponentRef={(ref) => { console.log(ref); this.tableRef = ref; }}
                    requestUrl='/api/admin/account/roles'
                    tableProps={{ columns }}
                    otherComponent={<Button type='primary' onClick={() => this.add()}>新建账号</Button>} />
                <Modal
                    visible={this.visible}
                    title={this.editId ? '编辑角色' : '新增角色'}
                    onOk={() => this.submit()}
                    onCancel={() => { this.visible = false; this.props.form.resetFields(); }}
                >
                    <BaseForm form={this.props.form} item={formItem} />
                </Modal>
            </Title>
        );
    }
}
export const Role = Form.create()(RoleView);
