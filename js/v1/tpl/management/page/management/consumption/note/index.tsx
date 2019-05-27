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
            { title: '接收手机号', key: 'phone', dataIndex: 'phone' },
            { title: '发送时间', key: 'created_at', dataIndex: 'created_at' },
            { title: '类型', key: 'sms_type', dataIndex: 'sms_type', render(sms_type: number | string) { return +sms_type === 1 ? '短信' : '语音'; }  },
            { title: '短信内容', key: 'message', dataIndex: 'message' },
            { title: '计费条数', key: 'count', dataIndex: 'count' },
            { title: '发送状态', key: 'send_status_name', dataIndex: 'send_status_name' },
            { title: '接收状态', key: 'report_status_name', dataIndex: 'report_status_name' },
            { title: '备注', key: 'remarks', dataIndex: 'remarks' },
        ];
        const search: BaseFormItem[] = [
            { itemProps: { label: '接收手机号', hasFeedback: false }, typeComponentProps: { placeholder: '接收手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '发送时间', hasFeedback: false }, typeComponentProps: { placeholder: ['开始时间', '结束时间'] }, key: 'date', type: 'rangePicker' },
            {
                itemProps: { label: '发送状态', hasFeedback: false }, key: 'send_status', type: 'select', options: [
                    { label: '全部', value: '-1' },
                    { label: '发送中', value: '1' },
                    { label: '发送失败', value: '2' },
                    { label: '发送成功', value: '3' },
                ],
            },
            {
                itemProps: { label: '接收状态', hasFeedback: false }, key: 'report_status', type: 'select', options: [
                    { label: '全部', value: '-1' },
                    { label: '接受中', value: '1' },
                    { label: '接收成功', value: '2' },
                    { label: '接受失败', value: '3' },
                ],
            },
            {
                itemProps: { label: '类型', hasFeedback: false }, key: 'status', type: 'select', options: [
                    { label: '全部', value: '-1' },
                    { label: '语音', value: '3' },
                    { label: '短信', value: '1' },
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
                    ref={(ref) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/consume/message'
                    tableProps={{ columns }}
                    listKey={'data'}
                    query={{ search }}
                />
            </Title>
        );
    }
}
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;
