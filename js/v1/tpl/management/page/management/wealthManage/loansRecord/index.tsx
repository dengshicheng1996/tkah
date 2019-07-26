import { Form } from 'common/antd/form';
import { SearchTable, TableList } from 'common/component/searchTable';
import { ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import {objectToOption} from 'common/tools';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {Link} from 'react-router-dom';
import {withAppState} from '../../../../common/appStateStore';
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
            json.start_loan_date = data.time[0].format('YYYY-MM-DD');
            json.end_loan_date = data.time[1].format('YYYY-MM-DD');
            delete json.time;
        }
        return json;
    }

    render() {
        const jurisdiction: number[] = this.props.data.appState.jurisdiction || [];
        const columns = [
            { title: '贷款编号', key: 'loan_no', dataIndex: 'loan_no', fixed: true, width: '200px'},
            { title: '客户姓名', key: 'name', dataIndex: 'name', fixed: true, width: '100px',
                render: (data: string, record: any) => {
                    return jurisdiction.indexOf(69) > -1 ? <Link to={'management/custorm/list/' + record.customer_id}>{data}</Link> : data;
                },
            },
            { title: '放款时间', key: 'pay_time_text', dataIndex: 'pay_time_text' },
            { title: '放款通道', key: 'pay_channel_text', dataIndex: 'pay_channel_text' },
            { title: '操作人', key: 'operator', dataIndex: 'operator' },
            { title: '放款金额', key: 'amount', dataIndex: 'amount' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '贷款编号' }, typeComponentProps: { placeholder: '贷款编号' }, key: 'loan_no', type: 'input' },
            { itemProps: { label: '客户姓名' }, typeComponentProps: { placeholder: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '客户手机号' }, typeComponentProps: { placeholder: '客户手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '放款日期' }, key: 'time', type: 'rangePicker' },
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
                    requestUrl='/api/admin/finance/loans'
                    tableProps={{ columns }}
                    query={{ search }}
                    beforeRequest={(data) => this.beforeRequest(data)}
                />
            </Title>
        );
    }
}
const ExportViewCom: any = Form.create()(Account);
export default withAppState(ExportViewCom);
