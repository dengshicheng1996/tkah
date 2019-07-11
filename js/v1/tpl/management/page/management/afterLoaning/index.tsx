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
import { observer } from 'mobx-react';
import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import {withAppState} from '../../../common/appStateStore';
import CardClass from '../../../common/CardClass';
import Condition from '../../../common/Condition';
import Title from '../../../common/TitleComponent';

@observer
class ManualCollectionComponent extends React.Component<any, any> {
    @observable private loading: boolean = false;
    constructor(props: any) {
        super(props);
    }
    ManualCollection() {
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                json.fenqi_order_id = this.props.info.id;
                this.loading = true;
                const res: any = await mutate<{}, any>({
                    url: '/api/admin/afterloan/repay/bill',
                    method: 'post',
                    variables: json,
                }).catch((error: any) => {
                    Modal.error({
                        title: '警告',
                        content: `Error: ${JSON.stringify(error)}`,
                    });
                    return {};
                });
                this.loading = false;
                if (res.status_code === 200) {
                    message.success('操作成功');
                    this.cancel();
                    this.props.onOk({ id: this.props.info.loan_id });
                } else {
                    message.error(res.message);
                }
            }
        });
    }
    setValue() {
        this.props.form.setFieldsValue({
            capital: '',
            faxi: '',
            lixi: '',
            fee: '',
        });
    }
    cancel() {
        this.props.cancel();
        this.props.form.resetFields();
    }
    ClearChange(data: number) {
        if (data === 1) {
            const info = this.props.info || {};
            this.props.form.setFieldsValue({
                capital: info.unpaid_capital || '',
                faxi: info.unpaid_overdue || '',
                lixi: info.unpaid_lixi || '',
                fee: info.unpaid_fee || '',
            });
        } else {
            this.props.form.setFieldsValue({
                capital: '',
                faxi: '',
                lixi: '',
                fee: '',
            });
        }
    }
    render() {
        const info = this.props.info || {};
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '是否结清本期' },
                required: true,
                typeComponentProps: {onChange: (data: number) => {this.ClearChange(data); }, placeholder: '请选择'},
                key: 'is_clear',
                type: 'select',
                options: [{ label: '是', value: 1 }, { label: '否', value: 0 }],
            },
            { itemProps: { label: '实还本金' }, required: true, key: 'capital', type: 'input' },
            { itemProps: { label: '实还罚息' }, required: true, key: 'faxi', type: 'input' },
            { itemProps: { label: '实还利息' }, required: true, key: 'lixi', type: 'input' },
            { itemProps: { label: '实还手续费' }, required: true, key: 'fee', type: 'input' },
        ];
        return (<Modal
            title={'手动回款'}
            width={800}
            visible={this.props.ManualCollectionVisible}
            onOk={() => this.ManualCollection()}
            onCancel={() => this.cancel()}
        >
            <Spin spinning={this.loading}>
                <div>
                    <span style={{ marginRight: 10 }}>结欠本金：{this.props.info.unpaid_capital}元</span>
                    <span style={{ marginRight: 10 }}>结欠利息：{this.props.info.unpaid_lixi}元</span>
                    <span style={{ marginRight: 10 }}>结欠罚息：{this.props.info.unpaid_overdue}元</span>
                    <span>结欠手续费：{this.props.info.unpaid_fee}元</span>
                </div>
                <BaseForm item={formItem} form={this.props.form} />
                <div style={{color: 'red'}}>
                    <p>注意：</p>
                    <p>1.手动回款功能针对除系统自动代扣之外的客户还款进行回款登记。</p>
                    <p>2.逾期减免也可通过此功能进行操作。</p>
                    <p>3.手动回款操作前需要确认客户已还款，提交后不可撤销</p>
                </div>
            </Spin>
        </Modal>);
    }
}
const ManualCollection: any = Form.create()(ManualCollectionComponent);

@observer
class ExhibitionComponent extends React.Component<any, any> {
    @observable private loading: boolean = false;
    @observable private fee: number = 0;
    constructor(props: any) {
        super(props);
    }
    exhibition() {
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);

                if (!/^(([1-9]\d*)|\d)(\.\d{1,2})?$/g.test(json.fee)) {
                    return message.error('请填写正确的金额');
                }
                if (!/^\d{1,}$/g.test(json.day)) {
                    return message.error('请填写正确的天数');
                }
                this.loading = true;
                const res: any = await mutate<{}, any>({
                    url: '/api/admin/afterloan/extension/' + this.props.info.id,
                    method: 'post',
                    variables: json,
                }).catch((error: any) => {
                    Modal.error({
                        title: '警告',
                        content: `Error: ${JSON.stringify(error)}`,
                    });
                    return {};
                });
                this.loading = false;
                if (res.status_code === 200) {
                    message.success('操作成功');
                    this.cancel();
                    // this.props.onOk({ id: this.props.info.loan_id});
                } else {
                    message.error(res.message);
                }
            }
        });
    }
    cancel() {
        this.props.cancel();
        this.props.form.resetFields();
    }
    render() {
        const info = this.props.info || {};
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '展期手续费' }, typeComponentProps: {onChange: (e: any) => this.fee = e.target.value}, required: true, key: 'fee', type: 'input' },
            { itemProps: { label: '展期天数' }, required: true, key: 'day', type: 'input' },
        ];
        return (<Modal
            title={'展期'}
            width={800}
            visible={this.props.ManualCollectionVisible}
            onOk={() => this.exhibition()}
            onCancel={() => this.cancel()}
        >
            <Spin spinning={this.loading}>
                <div style={{marginBottom: '20px'}}>
                    <span style={{ marginRight: 10 }}>应还利息（元）：{this.props.info.unpaid_lixi}</span>
                    <span style={{ marginRight: 10 }}>罚息（元）：{this.props.info.unpaid_overdue}</span>
                </div>
                <BaseForm item={formItem} form={this.props.form} />
                <div>
                   <span>费用合计: {this.props.info.unpaid_lixi + this.props.info.unpaid_overdue + (isNaN(+this.fee) ? 0 : +this.fee)}</span>
                </div>
                <div style={{color: 'red'}}>
                    <p>注意：</p>
                    <p>1.办理展期会签定展期合同。</p>
                    <p>2.展期费用需要线下向客户手去，再使用该功能进行展期登记。</p>
                    <p>3.展期提交后不可撤销</p>
                </div>
            </Spin>
        </Modal>);
    }
}
const Exhibition: any = Form.create()(ExhibitionComponent);
@observer
class Account extends React.Component<any, any> {
    private modal: any;
    private tableRef: any;
    @observable private visible: boolean = false;
    @observable private ManualCollectionVisible: boolean = false;
    @observable private exhibitionVisible: boolean = false;
    @observable private repayStatusList: any[] = [];
    @observable private overdueStatusList: any[] = [];
    @observable private ManualCollectionInfo: any = {};
    @observable private exhibitionModal: any = {};
    @observable private exhibitionInfo: any = {};
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
        this.repayStatusList = [{ label: '全部', value: '-1' }].concat(objectToOption(res.data.repays));
        this.overdueStatusList = [{ label: '全部', value: '-1' }].concat(objectToOption(res.data.overdues));
    }
    beforeRequest(data: any) {
        const json: any = data;
        if (data.repaymentTime && data.repaymentTime.length > 0) {
            json.repaymentStartTime = data.repaymentTime[0].format('YYYY-MM-DD');
            json.repaymentEndTime = data.repaymentTime[1].format('YYYY-MM-DD');
            delete json.apply_date;
        }
        if (data.loanTime && data.loanTime.length > 0) {
            json.loanStartTime = data.loanTime[0].format('YYYY-MM-DD');
            json.loanEndTime = data.loanTime[1].format('YYYY-MM-DD');
            delete json.apply_date;
        }
        return json;
    }
    async getInfo(record: any) {
        this.ManualCollectionVisible = true;
        const res: any = await mutate<{}, any>({
            url: '/api/admin/afterloan/bill/' + record.id,
            method: 'get',
        });
        if (res.status_code === 200) {
            this.ManualCollectionInfo = res.data;
            this.modal.setValue();
        }
    }
    async exhibition(data: any) {
        this.exhibitionVisible = true;
        const res: any = await mutate<{}, any>({
            url: '/api/admin/afterloan/extension/' + data.id,
            method: 'get',
        });
        if (res.status_code === 200) {
            this.exhibitionInfo = res.data;
        }
    }
    async getExpander(expanded: boolean, record: any) {
        if (!expanded) {
            return false;
        }
        const res: any = await mutate<{}, any>({
            url: '/api/admin/afterloan/order/' + record.id,
            method: 'get',
        });
        this.expander[record.id + ''] = res.data;
        this.forceUpdate();
    }
    getExpanderDom(record: any) {
        const jurisdiction: number[] = this.props.data.appState.jurisdiction || [];
        const res = this.expander[record.id + ''];
        if (!res) {
            return <Spin />;
        }
        const planColumn = [
            { title: '期数', key: 'period', dataIndex: 'period' },
            { title: '还款日期', key: 'should_repayment_date', dataIndex: 'should_repayment_date' },
            { title: '应还本金', key: 'capital_price', dataIndex: 'capital_price' },
            { title: '应还利息', key: 'lixi', dataIndex: 'lixi' },
            { title: '应还手续费', key: 'service_charge', dataIndex: 'service_charge' },
            { title: '罚息', key: 'overdue_price', dataIndex: 'overdue_price' },
            { title: '是否展期', key: 'is_extended_text', dataIndex: 'is_extended_text' },
            { title: '实际还款日', key: 'last_payment_at_text', dataIndex: 'last_payment_at_text' },
            { title: '实还本金', key: 'repaid_benjin', dataIndex: 'repaid_benjin' },
            { title: '实还利息', key: 'repaid_lixi', dataIndex: 'repaid_lixi' },
            { title: '实还手续费', key: 'repaid_fee', dataIndex: 'repaid_fee' },
            { title: '实还罚息', key: 'repaid_overdue', dataIndex: 'repaid_overdue' },
            { title: '是否结清', key: 'repay_status', dataIndex: 'repay_status', render: (data: any) => data === 3 ? '是' : '否' },
            {
                title: '操作', key: 'make', render: (data: any) =>
                    (<div>
                        {
                            jurisdiction.indexOf(60) > -1 && data.can_ext === 1 ? <Button style={{marginRight: 20}} type={'primary'} onClick={() => this.exhibition(data)}>展期</Button> : null
                        }
                        {
                            jurisdiction.indexOf(50) > -1 && data.repay_status !== 3 ? <Button type={'primary'} onClick={() => this.getInfo(data)}>手动回款</Button> : null
                        }
                    </div>),
            },
        ];
        const plan = <Table rowKey={'id'} columns={planColumn} dataSource={res.bills || []} pagination={false} />
        return <div>
            {
                res.fee
                    ?
                    <Condition
                        settleButton={jurisdiction.indexOf(49) > -1 }
                        deductButton={jurisdiction.indexOf(48) > -1 }
                        onOk={() => { this.getExpander(true, record); this.tableRef.getQuery().refresh(); }}
                        serviceChargeId={res.fee.id} customerId={res.fee ? res.fee.customer_id : ''}
                        dataSource={res.fee ? [res.fee] : []}/>
                    :
                    ''
            }
            <CardClass serviceChargeId={res.fee ? res.fee.id : ''} title={'还款计划表'} content={plan}/>
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
            { itemProps: { label: '还款状态' }, key: 'repay_status', initialValue: '-1', type: 'select', options: this.repayStatusList },
            { itemProps: { label: '逾期状态' }, key: 'overdue_status', initialValue: '-1', type: 'select', options: this.overdueStatusList },
            { itemProps: { label: '身份证号' }, key: 'idcard_number', type: 'input' },
        ];
        const component = (
            <div>
                <ManualCollection
                    wrappedComponentRef={(ref: TableList) => { this.modal = ref; }}
                    ManualCollectionVisible={this.ManualCollectionVisible}
                    cancel={() => { this.ManualCollectionVisible = false; }}
                    info={this.ManualCollectionInfo}
                    onOk={(data: any) => { this.getExpander(true, data); this.tableRef.getQuery().refresh(); }}
                />
                <Exhibition
                    wrappedComponentRef={(ref: TableList) => { this.exhibitionModal = ref; }}
                    ManualCollectionVisible={this.exhibitionVisible}
                    cancel={() => { this.exhibitionVisible = false; }}
                    info={this.exhibitionInfo}
                    onOk={(data: any) => { this.getExpander(true, data); this.tableRef.getQuery().refresh(); }}
                />
                <SearchTable
                    wrappedComponentRef={(ref: TableList) => { this.tableRef = ref; }}
                    query={{ search }}
                    requestUrl='/api/admin/afterloan/lists'
                    tableProps={{columns, expandedRowRender: (record: any) => this.getExpanderDom(record), onExpand: (ex: boolean, data: any) => this.getExpander(ex, data)}}
                    beforeRequest={(data) => this.beforeRequest(data)}
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
export default withAppState(Account);
