import { Form } from 'common/antd/form';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Link } from 'react-router-dom';
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
    contracts(data: any) {
        console.log(123312);
    }
    render() {
        const columns = [
            { title: '贷款编号', key: 'loan_no', dataIndex: 'loan_no', fixed: true, width: '200px'},
            { title: '客户姓名', key: 'name', dataIndex: 'name', fixed: true, width: '100px',
                render: (data: string, record: any) => {
                    return <Link to={'/management/customer/list/' + record.customer_id}>{data}</Link>;
                },
            },
            { title: '账单', key: 'period_text', dataIndex: 'period_text' },
            { title: '展期时间', key: 'ext_at_text', dataIndex: 'ext_at_text' },
            { title: '展期方式', key: 'mode_text', dataIndex: 'mode_text' },
            { title: '操作人', key: 'account_name', dataIndex: 'account_name' },
            { title: '展期总费用', key: 'total_fee', dataIndex: 'total_fee' },
            { title: '展期天数', key: 'days', dataIndex: 'days' },
            { title: '合同状态', key: 'contract_status_text', dataIndex: 'contract_status_text' },
            { title: '展期费用', key: 'fee', dataIndex: 'fee' },
            { title: '利息', key: 'lixi_before', dataIndex: 'lixi_before' },
            { title: '罚息', key: 'faxi_before', dataIndex: 'faxi_before' },
            { title: '操作', key: 'set', render: (data: any) => {
                    return <a onClick={() => this.contracts(data)}>查看合同</a>;
                },
            },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '贷款编号' }, typeComponentProps: { placeholder: '贷款编号' }, key: 'loan_no', type: 'input' },
            { itemProps: { label: '客户姓名' }, typeComponentProps: { placeholder: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '客户手机号' }, typeComponentProps: { placeholder: '客户手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '展期日期' }, key: 'time', type: 'rangePicker' },
            {
                itemProps: { label: '放款通道', hasFeedback: false }, key: 'pay_type', type: 'select',
                initialValue: '-1',
                options: [
                    {label: '全部', value: '-1'},
                    {label: '宝付', value: 7},
                    {label: '委贷', value: 8},
                    {label: '线下', value: 1},
                ],
            },
            { itemProps: { label: '操作人' }, typeComponentProps: { placeholder: '操作人' }, key: 'operator', type: 'input' },
        ];
        return (
            <Title>
                <SearchTable
                    ref={(ref) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/finance/extensions'
                    tableProps={{ columns, scroll: {x: 1500} }}
                    query={{ search }}
                    beforeRequest={(data) => this.beforeRequest(data)}
                />
            </Title>
        );
    }
}
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;
