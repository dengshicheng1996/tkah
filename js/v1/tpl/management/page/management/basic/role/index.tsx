import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import { mutate } from 'common/restFull';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import TableComponent from '../../../../common/TableComponent';
import Title from '../../../../common/TitleComponent';
const Option = Select.Option;
@observer
class Role extends React.Component<any, any> {
    @observable private visible: boolean = false;
    @observable private editId: string = '';
    @observable private loading: boolean = false;
    @observable private refresh: boolean = false;
    constructor(props: any) {
        super(props);
    }
    banSave(data: any) {
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
                this.refresh = !this.refresh;
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
            { title: '角色名称', key: 'role_name', dataIndex: 'role_name' },
            { title: '状态', key: 'status', dataIndex: 'status', render(status: number | string) { return +status === 1 ? '已启用' : '已禁用'; } },
            { title: '创建时间', key: 'created_at', dataIndex: 'created_at' },
            {
                title: '操作', key: 'edit', render(data: any) {
                    return (<div>
                        <a style={{ marginRight: '10px' }} onClick={() => that.banSave(data)}>{+data.status === 1 ? '禁用' : '启用'}</a>
                        <a onClick={() => that.edit(data)}>编辑</a>
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
                <TableComponent refresh={this.refresh} requestUrl={'/api/admin/account/roles'} otherButton={<Button type='primary' onClick={() => this.add()}>新建账号</Button>} columns={columns} />
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
const ExportViewCom = Form.create()(Role);
export default ExportViewCom;
