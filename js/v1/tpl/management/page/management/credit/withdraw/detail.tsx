import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { DatePicker } from 'common/antd/date-picker';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import { Spin } from 'common/antd/spin';
import { Table } from 'common/antd/table';
import { mutate } from 'common/component/restFull';
import { SearchTable } from 'common/component/searchTable';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as moment from 'moment';
import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import CardClass from '../../../../common/CardClass';
import Condition from '../../../../common/Condition';
import Title from '../../../../common/TitleComponent';
interface LoanPropsType {
    loanVisible: boolean;
    loanCancel: () => void;
    id: string | number;
    onOk: () => void;
    form?: any;
    credit: any;
}
@observer
class LoanComponent extends React.Component<LoanPropsType, any> {
    @observable private loading: boolean = false;
    @observable private init: any = {};
    @observable private payType: any = {};
    constructor(props: any) {
        super(props);
    }
    async getInit() {
        const json = {
            id: this.props.id,
        };
        const res: any = await mutate<{}, any>({
            url: '/api/admin/order/confirm/' + this.props.id,
            method: 'get',
            variables: json,
        }).catch((error: any) => {
            Modal.error({
                title: '警告',
                content: `Error: ${JSON.stringify(error)}`,
            });
            return {};
        });
        if (res.status_code === 200) {
            this.init.bankList = res.data.bank.map((item: any) => {
                return { label: item.bank_name + item.bank_num, value: item.id };
            });
            this.init.payChannel = res.data.pay_channel.map((item: any) => {
                return { label: item.pay_type_name, value: item.pay_type };
            });
            this.init.this_loan_amount = res.data.this_loan_amount;
            this.init.balance = res.data.pay_channel[0].balance;
            this.props.form.setFieldsValue({loan_amount: res.data.loan_order.this_loan_amount});
        }
    }
    onOk() {
        if (this.loading) {
            return;
        }
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                json.loan_id = this.props.id;
                this.loading = true;
                const res: any = await mutate<{}, any>({
                    url: '/api/admin/order/confirmbutton',
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
                    this.props.onOk();
                } else {
                    message.error(res.message);
                }
            }
        });
    }
    cancel() {
        this.getInit();
        this.props.form.resetFields();
        this.props.loanCancel();
    }
    payChange(data: any) {
        this.payType = data;
    }
    render() {
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '放款金额' }, key: 'loan_amount', type: 'input' },
            { itemProps: { label: '通道'},
                typeComponentProps: {onChange: (data: any) => this.payChange(data)},
                key: 'pay_type', type: 'select', options: this.init.payChannel || [] },
            { itemProps: { label: '账户信息', hasFeedback: false }, key: 'expired_at', component: <div>可用余额：{this.init.balance}元</div> },
            { itemProps: { label: '收款银行卡' }, key: 'bank_id', type: 'select', options: this.init.bankList || [] },
            { itemProps: { label: '备注' }, key: 'remark', type: 'textArea' },
        ];
        if (+this.payType === 1) {
            formItem.splice(2, 1);
        }
        return (<Modal
            forceRender
            title={'确认放款'}
            visible={this.props.loanVisible}
            onOk={() => this.onOk()}
            onCancel={() => this.cancel()}
        >
            <Spin spinning={this.loading}>
                <BaseForm item={formItem} form={this.props.form} />
            </Spin>
        </Modal>);
    }
}
const Loan: any = Form.create()(LoanComponent);
interface CancelPropsType {
    cancelVisible: boolean;
    cancel: () => void;
    id: string | number;
    onOk: () => void;
    form?: any;
}
@observer
class CancelComponent extends React.Component<CancelPropsType, any> {
    @observable private loading: boolean = false;
    constructor(props: any) {
        super(props);
    }
    cancelLoan() {
        if (this.loading) {
            return;
        }
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                json.loan_id = this.props.id;
                this.loading = true;
                const res: any = await mutate<{}, any>({
                    url: '/api/admin/order/cancel',
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
                    this.props.onOk();
                } else {
                    message.error(res.message);
                }
            }
        });
    }
    cancel() {
        this.props.form.setFieldsValue({ content: '' });
        this.props.cancel();
    }
    render() {
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '取消放款理由' }, initialValue: '', key: 'content', type: 'textArea' },
        ];
        return (<Modal
            title={'取消放款'}
            visible={this.props.cancelVisible}
            onOk={() => this.cancelLoan()}
            onCancel={() => this.cancel()}
        >
            <Spin spinning={this.loading}>
                <BaseForm item={formItem} form={this.props.form} />
            </Spin>
        </Modal>);
    }
}
const Cancel: any = Form.create()(CancelComponent);
@observer
export default class Audit extends React.Component<{}, any> {
    private loan: any;
    @observable private id: string | number = '';
    @observable private loading: boolean = false;
    @observable private loanVisible: boolean = false;
    @observable private cancelVisible: boolean = false;
    @observable private detail: any = {};
    constructor(props: any) {
        super(props);
        this.id = props.match.params.id;
    }
    componentDidMount() {
        this.getDetail();
    }
    async getDetail() {
        const json = {
            id: this.id,
        };
        const res: any = await mutate<{}, any>({
            url: '/api/admin/order/show/' + this.id,
            method: 'get',
            variables: json,
        });
        this.loading = false;
        if (res.status_code === 200) {
            this.detail = res.data;
        } else {
            message.error(res.message);
        }
    }
    render() {
        (this.detail.risk_rule || []).map((item: any, index: number) => {
            item.key = index;
        });
        (this.detail.fenqi || []).map((item: any, index: number) => {
            item.key = index;
        });
        (this.detail.apply_history || []).map((item: any, index: number) => {
            item.key = index;
        });
        (this.detail.loan_order_record || []).map((item: any, index: number) => {
            item.key = index;
        });
        (this.detail.operate || []).map((item: any, index: number) => {
            item.key = index;
        });
        const {
            loan_order = {},
            risk_report = {},
            apply_history = [],
            loan_order_record = [],
            customer = {},
            channel = {},
            customer_bank = {},
            loan_order_fee,
            fenqi = [],
            operate = [],
            loan_status_text = '',
            product_fee = [],
        } = this.detail;
        const loan_status: number  = loan_order.loan_status || 0;
        const orderColumn = [
            { title: '期数', key: 'period', dataIndex: 'period' },
            { title: '账单金额', key: 'period_amount', dataIndex: 'period_amount' },
            { title: '本金', key: 'capital_price', dataIndex: 'capital_price' },
            { title: '利息', key: 'lixi', dataIndex: 'lixi' },
            { title: '手续费', key: 'service_charge', dataIndex: 'service_charge' },
            { title: '账单天数', key: 'day_num', dataIndex: 'day_num' },
        ];
        const contractColumn = [
            { title: '合同', key: 'apply_at', dataIndex: 'apply_at' },
            { title: '状态', key: 'review_content', dataIndex: 'review_content' },
            { title: '备注', key: 'withdraw', dataIndex: 'withdraw' },
            { title: '操作', key: 'loan_at', dataIndex: 'loan_at' },
        ];
        const remitColumn = [
            { title: '时间', key: 'pay_time_text', dataIndex: 'pay_time_text' },
            { title: '操作人', key: 'operator_Name', dataIndex: 'operator_Name' },
            { title: '金额', key: 'amount', dataIndex: 'amount' },
            { title: '通道', key: 'pay_channel_text', dataIndex: 'pay_channel_text' },
            { title: '状态', key: 'pay_order_status_text', dataIndex: 'pay_order_status_text' },
            { title: '备注', key: 'remark', dataIndex: 'remark' },
            // { title: '失败原因', key: 'remark', dataIndex: 'remark' },
        ];
        const operateColumn = [
            { title: '时间', key: 'created_at', dataIndex: 'created_at' },
            { title: '操作人', key: 'account_name', dataIndex: 'account_name' },
            { title: '内容', key: 'content', dataIndex: 'content' },
        ];
        const order = <div>
            <Row style={{ fontSize: 22, marginBottom: 24 }}>
                {
                    product_fee.map((item: any, index: number) => {
                        return <Col key={index} span={6}>{item.name}：{item.after_value}<span style={{fontSize: '14px'}}>，{item.payment_text}</span></Col>;
                    })
                }
            </Row>
            <Table rowKey={'key'} columns={orderColumn} dataSource={fenqi || []} pagination={false} />
        </div>;
        const contract = <div>
            <Table rowKey={'key'} columns={contractColumn} dataSource={apply_history || []} pagination={false} />
        </div>;
        const interestPenalty = <div>
            <Row style={{ marginBottom: '15px' }}>
                <Col span={12}>罚息日利率（%）：{loan_order ? loan_order.faxi_day_rate : ''}</Col>
                <Col span={12}>罚息最高上限（占本金百分比）：{loan_order ? loan_order.faxi_upper_limit : ''}</Col>
            </Row>
        </div>;
        const remit = <div>
            <Table rowKey={'key'} columns={remitColumn} dataSource={loan_order_record || []} pagination={false} />
        </div>;
        const operateTable = <div>
            <Table rowKey={'key'} columns={operateColumn} dataSource={operate || []} pagination={false} />
        </div>;
        const component = [
            <div style={{ height: '110px' }}>
                <div style={{ width: '700px', float: 'left' }}>
                    <div style={{ fontSize: '24px', marginBottom: '15px' }}>
                        {
                            customer
                                ?
                                <span>{customer.phone}<span style={{ margin: '0 10px' }}>|</span>{customer.name}</span>
                                :
                                ''
                        }
                        <span style={{ fontSize: '14px', marginLeft: '60px' }}>{loan_status_text}</span>
                    </div>
                    <Row style={{ marginBottom: '15px' }}>
                        <Col span={4}>订单编号：{loan_order.id}</Col>
                        {/*<Col span={5}>负责人：{channel ? channel.name : ''}</Col>*/}
                        <Col span={6}>关联渠道：{channel.name}</Col>
                        <Col span={11}>收款银行卡：{customer_bank.bank_name + customer_bank.bank_num}</Col>
                    </Row>
                    <Row style={{ marginBottom: '15px' }}>
                        <Col span={8}>订单金额：{loan_order.loan_amount}元</Col>
                        <Col span={8}>应放款金额：{loan_order.should_loan_amount}元</Col>
                        <Col span={8}>已放款：{loan_order.already_loan_amount}元</Col>
                    </Row>
                </div>
                <div style={{ width: '300px', float: 'right' }}>
                    {
                        [1, 2, 5].indexOf(loan_status) > -1 ? <Button style={{ marginRight: 20 }} type='primary'
                                                               onClick={() => {
                                                                   this.loanVisible = true;
                                                                   this.loan.getInit();
                                                               }}>确认放款</Button> : ''
                    }
                    {
                        [1, 5].indexOf(loan_status) > -1 ? <Button type='primary' onClick={() => this.cancelVisible = true}>取消放款</Button> : ''
                    }
                </div>
                <div>
                    <Loan wrappedComponentRef={(ref: any) => {
                        this.loan = ref;
                    }} id={this.id} onOk={() => this.getDetail()} loanCancel={() => { this.loanVisible = false; }} loanVisible={this.loanVisible} />
                    <Cancel onOk={() => this.getDetail()} id={this.id} cancel={() => { this.cancelVisible = false; }} cancelVisible={this.cancelVisible} />
                </div>
            </div>,
            <CardClass title='费用和账单' content={order} />,
            loan_order_fee ?
            <Condition
                // id={id ? loan_order.id : ''}
                onOk={() => this.getDetail()}
                serviceChargeId={loan_order_fee.service_charge_id}
                customerId={customer.id}
                data={[loan_order_fee]}
            /> : '',
            <CardClass title='罚息配置' content={interestPenalty} />,
            // <CardClass title='借款合同' content={contract} />,
            <CardClass title='打款记录' content={remit} />,
            <CardClass title='操作记录' content={operateTable} />,
        ];
        return (
            <Title component={component} />
        );
    }
}
