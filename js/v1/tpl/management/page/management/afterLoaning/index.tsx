import { Button } from 'common/antd/button';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Row } from 'common/antd/row';
import { Spin } from 'common/antd/spin';
import { Table } from 'common/antd/table';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { objectToOption } from 'common/tools';
import * as _ from 'lodash';
import { computed, observable, toJS } from 'mobx';
import {observer } from 'mobx-react';
import * as React from 'react';
import Condition from '../../../common/Condition';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import CardClass from '../../../common/CardClass';
import Title from '../../../common/TitleComponent';

@observer
export default class Account extends React.Component<any, any> {
    private tableRef: TableList;
    @observable private visible: boolean = false;
    @observable private repayStatusList: any[] = [];
    @observable private overdueStatusList: any[] = [];
    @observable private expander: any = {};

    constructor(props: any) {
        super(props);
    }
    // admin/apply/search
    async componentDidMount() {
        const res: any = await mutate<{}, any>({
            url: '/api/admin/afterloan/section',
            method: 'get',
        });
        this.repayStatusList = [{label: '全部', value: '-1'}].concat(objectToOption(res.data.repays));
        this.overdueStatusList = [{label: '全部', value: '-1'}].concat(objectToOption(res.data.overdues));
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
    async getExpander(expanded: boolean, record: any) {
        if (!expanded) {
            return false;
        }
        const res: any = await mutate<{}, any>({
            url: '/api/admin/afterloan/billlist/' + record.id,
            method: 'get',
        });
        this.expander[record.id + ''] = res.data;
        this.forceUpdate();
    }
    getExpanderDom(record: any) {
        const res = this.expander[record.id + ''];
        if (!res) {
            return <Spin></Spin>;
        }
        const planColumn = [
            { title: '期数', key: 'period', dataIndex: 'period' },
            { title: '还款日期', key: 'should_repayment_date', dataIndex: 'should_repayment_date' },
            { title: '应还本金', key: 'capital_price', dataIndex: 'capital_price' },
            { title: '应还利息', key: 'lixi', dataIndex: 'lixi' },
            { title: '应还手续费', key: 'service_charge', dataIndex: 'service_charge' },
            { title: '罚息', key: 'overdue_price', dataIndex: 'overdue_price' },
            { title: '是否展期', key: 'allow_extend', dataIndex: 'allow_extend' },
            { title: '实际还款日', key: 'original_repayment_date', dataIndex: 'original_repayment_date' },
            { title: '实还本金', key: 'repaid_benjin', dataIndex: 'repaid_benjin' },
            { title: '实还利息', key: 'repaid_lixi', dataIndex: 'repaid_lixi' },
            { title: '实还手续费', key: 'repaid_fee', dataIndex: 'repaid_fee' },
            { title: '实还罚息', key: 'repaid_overdue', dataIndex: 'repaid_overdue' },
            { title: '是否结清', key: 'repay_status_text', dataIndex: 'repay_status_text' },
            { title: '操作', key: 'make', render: (data: any) => {
                    return <Button type={'primary'}>手动回款</Button>;
                },
            },
        ];
        const plan = <div>
            <Table rowKey={'id'} columns={planColumn} dataSource={res || []} pagination={false} />
        </div>;
        return <div>
            <Condition id={record.id} data={res}/>
            <CardClass title={'还款计划表'} content={plan}/>
        </div>;
    }
    render() {
        const columns = [
            { title: '贷款编号', key: 'id', dataIndex: 'id' },
            { title: '姓名', key: 'name', dataIndex: 'name' },
            { title: '手机号', key: 'phone', dataIndex: 'phone' },
            { title: '本期还款日期', key: 'should_repayment_date', dataIndex: 'should_repayment_date' },
            { title: '贷款本金', key: 'loan_amount', dataIndex: 'loan_amount'},
            { title: '未还本金', key: 'notyet_amount', dataIndex: 'notyet_amount' },
            { title: '待还期数', key: 'waiting_period', dataIndex: 'waiting_period' },
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
                    tableProps={{columns, expandedRowRender: (record: any) => this.getExpanderDom(record), onExpand: (ex: boolean, data: any) => this.getExpander(ex, data)}}
                    beforeRequest={(data) => this.beforeRequest(data)}
                />
                <div style={{display: 'none'}}>{JSON.stringify(this.expander)}</div>
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
