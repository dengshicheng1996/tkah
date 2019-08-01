import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { SearchTable, TableList } from 'common/component/searchTable';
import {  ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { observer } from 'mobx-react';
import * as React from 'react';
import {getSearch, setSearch} from '../../../../../common/tools';
import {withAppState} from '../../../../common/appStateStore';
import Title from '../../../../common/TitleComponent';

@observer
class Account extends React.Component<any, any> {
    private tableRef: TableList;
    constructor(props: any) {
        super(props);
    }
    beforeRequest(data: any) {
        const json: any = data;
        setSearch(this.props.data.appState.panes, this.props.data.appState.activePane, JSON.parse(JSON.stringify(data)));
        if (data.date && data.date.length > 0) {
            json.start_date = data.date[0].format('YYYY-MM-DD');
            json.end_date = data.date[1].format('YYYY-MM-DD');
            delete json.date;
        }
        return json;
    }
    render() {
        const that: any = this;
        const columns = [
            { title: '接收手机号', key: 'phone', dataIndex: 'phone' },
            { title: '发送时间', key: 'created_at', dataIndex: 'created_at' },
            { title: '类型', key: 'sms_type_name', dataIndex: 'sms_type_name' },
            { title: '短信内容', key: 'message', dataIndex: 'message' },
            { title: '计费条数', key: 'count', dataIndex: 'count' },
            { title: '发送状态', key: 'send_status_name', dataIndex: 'send_status_name' },
            { title: '接收状态', key: 'report_status_name', dataIndex: 'report_status_name' },
            { title: '备注', key: 'remarks', dataIndex: 'remarks' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '接收手机号', hasFeedback: false }, typeComponentProps: { placeholder: '接收手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '发送时间', hasFeedback: false }, typeComponentProps: { placeholder: ['开始时间', '结束时间'] }, key: 'date', type: 'rangePicker' },
            {
                itemProps: { label: '发送状态', hasFeedback: false }, key: 'send_status', type: 'select', options: [
                    { label: '全部', value: '-1' },
                    { label: '发送中', value: '1' },
                    { label: '发送失败', value: '3' },
                    { label: '发送成功', value: '2' },
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
                itemProps: { label: '类型', hasFeedback: false }, key: 'sms_type', type: 'select', options: [
                    { label: '全部', value: '-1' },
                    { label: '语音', value: '3' },
                    { label: '短信', value: '1' },
                ],
            },
        ];
        return (
            <Title>
                <SearchTable
                    ref={(ref) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/consume/message'
                    tableProps={{ columns }}
                    listKey={'data'}
                    query={{ search }}
                    autoSearch={getSearch(this.props.data.appState.panes, this.props.data.appState.activePane)}
                    beforeRequest={(data) => this.beforeRequest(data)}
                />
            </Title>
        );
    }
}
const ExportViewCom: any = Form.create()(Account);
export default withAppState(ExportViewCom);
