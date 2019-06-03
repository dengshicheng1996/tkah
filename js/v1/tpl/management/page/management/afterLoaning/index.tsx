import { Button } from 'common/antd/button';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Row } from 'common/antd/row';
import { Spin } from 'common/antd/spin';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { objectToOption } from 'common/tools';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import CardClass from '../../../common/CardClass';
import Title from '../../../common/TitleComponent';

@observer
class Account extends React.Component<any, any> {
    private tableRef: TableList;
    @observable private visible: boolean = false;
    @observable private repayStatusList: any[] = [];
    @observable private overdueStatusList: any[] = [];
    constructor(props: any) {
        super(props);
    }
    // admin/apply/search
    async componentDidMount() {
        const res: any = await mutate<{}, any>({
            url: '/api/admin/afterloan/section',
            method: 'get',
        });
        this.repayStatusList = objectToOption(res.data.repays);
        this.overdueStatusList = objectToOption(res.data.overdues);

    }
    beforeRequest(data: any) {
        const json: any = data;
        if (data.repaymentTime) {
            json.repaymentStartTime = data.repaymentTime[0].format('YYYY-MM-DD');
            json.repaymentEndTime = data.repaymentTime[1].format('YYYY-MM-DD');
            delete json.apply_date;
        }
        if (data.loanTime) {
            json.loanStartTime = data.loanTime[0].format('YYYY-MM-DD');
            json.loanEndTime = data.loanTime[1].format('YYYY-MM-DD');
            delete json.apply_date;
        }
        return json;
    }
    getExpander(record: any) {
        return <div>123123</div>;
    }
    render() {
        const columns = [
            { title: '贷款编号', key: 'id', dataIndex: 'id' },
            { title: '姓名', key: 'name', dataIndex: 'name' },
            { title: '手机号', key: 'phone', dataIndex: 'phone' },
            { title: '本期还款日期', key: 'should_repayment_date', dataIndex: 'should_repayment_date' },
            { title: '贷款本金', key: 'loan_amount', dataIndex: 'loan_amount'},
            { title: '未还本金', key: 'notyet_amount', dataIndex: 'notyet_amount' },
            { title: '待还期数', key: 'waiting period', dataIndex: 'waiting period' },
            { title: '放款日期', key: 'loan_at', dataIndex: 'loan_at' },
            { title: '还款状态', key: 'repay_status_text', dataIndex: 'repay_status_text' },
            { title: '逾期状态', key: 'overdue_status_text', dataIndex: 'overdue_status_text' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '还款日期' }, key: 'repaymentTime', type: 'rangePicker' },
            { itemProps: { label: '放款日期' }, key: 'loanTime', type: 'rangePicker' },
            { itemProps: { label: '还款状态' }, key: 'repay_status', type: 'select', options: this.repayStatusList },
            { itemProps: { label: '逾期状态' }, key: 'overdue_status', type: 'select', options: this.overdueStatusList },
            { itemProps: { label: '身份证号' }, key: 'idcard_number', type: 'input' },
        ];
        const component = (
            <div>
                <SearchTable
                    ref={(ref) => {
                        this.tableRef = ref;
                    }}
                    query={{ search }}
                    requestUrl='/api/admin/afterloan/lists'
                    tableProps={{columns, expandedRowRender: () => '123'}}
                    beforeRequest={(data) => this.beforeRequest(data)}
                    // expandedRowRender={this.getExpander}
                />
            </div>
        );
        return (
            <Title>
                {
                    component
                }
            </Title>
        );
    }
}
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;
