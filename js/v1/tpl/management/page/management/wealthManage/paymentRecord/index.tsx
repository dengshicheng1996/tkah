import { Form } from 'common/antd/form';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import {objectToOption} from 'common/tools';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {Link} from 'react-router-dom';
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
            json.start_ext_date = data.time[0].format('YYYY-MM-DD');
            json.end_ext_date = data.time[1].format('YYYY-MM-DD');
            delete json.time;
        }
        return json;
    }

    render() {
        const columns = [
            { title: '贷款编号', key: 'loan_no', dataIndex: 'loan_no', fixed: true, width: '200px'},
            { title: '客户姓名', key: 'name', dataIndex: 'name', fixed: true, width: '100px',
                render: (data: string, record: any) => {
                    return <Link to={'/management/customer/list/' + record.customer_id}>{data}</Link>;
                },
            },
            { title: '类型', key: 'repayment_type_text', dataIndex: 'repayment_type_text' },
            { title: '还款时间', key: 'payment_at_text', dataIndex: 'payment_at_text' },
            { title: '还款方式', key: 'type_text', dataIndex: 'type_text' },
            { title: '操作人', key: 'operator', dataIndex: 'operator' },
            { title: '还款金额', key: 'amount', dataIndex: 'amount' },
            { title: '本金', key: 'capital', dataIndex: 'capital' },
            { title: '利息', key: 'lixi', dataIndex: 'lixi' },
            { title: '手续费', key: 'fee', dataIndex: 'fee' },
            { title: '罚息', key: 'faxi', dataIndex: 'faxi' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '贷款编号' }, typeComponentProps: { placeholder: '贷款编号' }, key: 'loan_no', type: 'input' },
            { itemProps: { label: '客户姓名' }, typeComponentProps: { placeholder: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '客户手机号' }, typeComponentProps: { placeholder: '客户手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '还款日期' }, key: 'time', type: 'rangePicker' },
            {
                itemProps: { label: '还款方式', hasFeedback: false }, key: 'type', type: 'select',
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
