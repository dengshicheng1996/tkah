import { Form } from 'common/antd/form';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import {objectToOption} from 'common/tools';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import Title from '../../../../common/TitleComponent';

@observer
class Account extends React.Component<any, any> {
    private tableRef: TableList;
    @observable private channel: any[] = [];
    constructor(props: any) {
        super(props);
    }
    beforeRequest(data: any) {
        const json: any = data;
        if (data.time && data.time.length > 0) {
            json.start_payment_date = data.time[0].format('YYYY-MM-DD');
            json.end_payment_date = data.time[1].format('YYYY-MM-DD');
            delete json.time;
        }
        return json;
    }
    componentDidMount() {
        mutate<{}, any>({
            url: '/api/admin/basicconfig/searchchannel',
            method: 'get',
        }).then(r => {
            if (r.status_code === 200) {
                this.channel = objectToOption(r.data);
            }
        });
    }

    render() {
        const columns = [
            { title: '贷款编号', key: 'phone', dataIndex: 'phone' },
            { title: '客户姓名', key: 'name', dataIndex: 'name' },
            { title: '类型', key: 'channel_name', dataIndex: 'channel_name' },
            { title: '还款时间', key: 'created_at', dataIndex: 'created_at' },
            { title: '还款方式', key: 'created_at', dataIndex: 'created_at' },
            { title: '操作人', key: 'created_at', dataIndex: 'created_at' },
            { title: '还款金额', key: 'created_at', dataIndex: 'created_at' },
            { title: '本金', key: 'created_at', dataIndex: 'created_at' },
            { title: '利息', key: 'created_at', dataIndex: 'created_at' },
            { title: '手续费', key: 'created_at', dataIndex: 'created_at' },
            { title: '罚息', key: 'created_at', dataIndex: 'created_at' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '贷款编号' }, typeComponentProps: { placeholder: '贷款编号' }, key: 'loan_no', type: 'input' },
            { itemProps: { label: '客户姓名' }, typeComponentProps: { placeholder: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '客户手机号' }, typeComponentProps: { placeholder: '客户手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '还款日期' }, key: 'time', type: 'rangePicker' },
            {
                itemProps: { label: '渠道名称', hasFeedback: false }, key: 'type', type: 'select',
                options: [
                    {label: '全部', value: '-1'},
                    {label: '主动还款', value: 1},
                    {label: '后台手动回款', value: 2},
                    {label: '自动扣款', value: 3},
                ],
            },
            { itemProps: { label: '操作人' }, typeComponentProps: { placeholder: '操作人' }, key: 'operator', type: 'input' },
        ];
        return (
            <Title>
                <SearchTable
                    ref={(ref) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/finance/repayments'
                    tableProps={{ columns }}
                    query={{ search }}
                    beforeRequest={(data) => this.beforeRequest(data)}
                />
            </Title>
        );
    }
}
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;
