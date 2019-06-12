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
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import CardClass from '../../../../common/CardClass';
import Title from '../../../../common/TitleComponent';
import history from './history';
import list from './list';

interface RechargePropsType {
    rechargeVisible: boolean;
    rechargeCancel: any;
    form?: any;
    payType: string | number;
    bankList: any[];
    balance: string | number;
}

@observer
class Recharge extends React.Component<RechargePropsType, any> {
    @observable private loading: boolean = false;
    @observable private payMethodValue: string | number = 1;
    @observable private infoVisible: boolean = false;
    @observable private info: any = {};
    @observable private verifyCode: string = '';
    constructor(props: any) {
        super(props);
    }
    rechargeSubmit() {
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                this.loading = true;
                if (this.payMethodValue === 2) {
                    console.log(this.payMethodValue);
                    const json = {
                        amount: values.amount,
                        payType: this.props.payType,
                        verifyCodeType: 'daikou',
                        payMethod: 2,
                        bankAccountId: values.bankAccountId,
                    };
                    const res: any = await mutate<{}, any>({
                        url: '/api/admin/payment/recharge',
                        method: 'post',
                        variables: json,
                    }).catch((error) => {
                        this.loading = false;
                        Modal.error({
                            title: '警告',
                            content: `Error: ${JSON.stringify(error)}`,
                        });
                    });
                    this.loading = false;
                    if (res.status_code === 200) {
                        this.props.rechargeCancel();
                        this.init();
                        Modal.success({
                            title: '充值码',
                            content: <div>
                                <p>您的充值申请已经生成！</p>
                                <p>充值金额：<span style={{color: 'red'}}>{values.amount / 10000}万元</span></p>
                                <p>请务必在打款时备注：{res.data.pay.trade_no}</p>
                            </div>,
                        });
                    }
                } else {
                    const json: any = {
                        amount: values.amount,
                        bankAccountId: values.bankAccountId,
                        type: 'daikou',
                        payType: this.props.payType,
                        payMethod: this.payMethodValue,
                    };
                    mutate<{}, any>({
                        url: '/api/admin/payment/config',
                        method: 'post',
                        variables: json,
                    }).then(r => {
                        this.loading = false;
                        if (r.status_code === 200) {
                            this.infoVisible = true;
                            this.info = r.data;
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
            }
        });
    }
    init() {
        this.verifyCode = '';
        this.payMethodValue = 1;
        this.props.form.resetFields();
    }
    async submit() {
        const json = {
            amount: this.info.amount,
            payType: this.props.payType,
            verifyCodeType: 'daikou',
            verifyCode: this.verifyCode,
            payMethod: this.payMethodValue,
            bankAccountId: this.props.form.getFieldValue('bankAccountId'),
        };
        const res: any = await mutate<{}, any>({
            url: '/api/admin/payment/recharge',
            method: 'post',
            variables: json,
        }).catch((error) => {
            this.loading = false;
            Modal.error({
                title: '警告',
                content: `Error: ${JSON.stringify(error)}`,
            });
        });
        if (res.status_code === 200) {
            message.success('操作成功');
            this.infoVisible = false;
            this.props.rechargeCancel();
            this.init();
        }
    }
    render() {
        // const verifyCode = <div><Input style={{width: 100, marginRight: '20px'}} /><Button onClick={() => this.getVerify()}>获取校验码</Button></div>
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            {
                itemProps: { label: '充值方式' }, initialValue: 1, key: 'payMethod', type: 'select',
                typeComponentProps: { onChange: (value: number) => this.payMethodValue = value },
                options: [{ label: '线上充值（从银行卡直接扣款）', value: 1 }, { label: '转账充值（转账到云贝保理）', value: 2 }]
            },
            { itemProps: { label: '账户余额', hasFeedback: true }, key: 'amo', component: <span>{this.props.balance}</span> },
            { itemProps: { label: '充值金额' }, key: 'amount', type: 'input' },
            { itemProps: { label: '选择银行卡' }, key: 'bankAccountId', type: 'select', options: this.props.bankList },
        ];
        // this.payMethodValue === 1 && formItem.push();
        return (
            <div>
                <Modal
                    visible={this.props.rechargeVisible}
                    title='充值'
                    onOk={() => this.rechargeSubmit()}
                    onCancel={() => { this.props.rechargeCancel(); }}
                >
                    <Spin spinning={this.loading}>
                        <BaseForm form={this.props.form} item={formItem} />
                        {
                            this.payMethodValue === 1
                                ?
                                ''
                                :
                                <div>
                                    <p> 转账注意事项:</p>
                                    <p>1. 转账至云贝保理仅适用于大额充值，充值金额20万起，请输入万的整数倍；</p>
                                    <p>2. 请务必确保充值金额、打款账户正确无误；</p>
                                    <p>3. 请务必将系统稍后生成的随机码填入银行转账备注；</p>
                                    <p>4. 如充值金额、打款账户、随机码与申请信息不一致，款项将不会到账，并将自动在3个工作日内退款；</p>
                                    <p>5. 工作日17:00前充值，次日12：00到账，其他时间及节假日顺延；</p>
                                    <p>6. 如需添加其他银行卡，请联系客服。</p>
                                </div>
                        }
                    </Spin>
                </Modal>
                <Modal
                    visible={this.infoVisible}
                    title='提示'
                    onOk={() => this.submit()}
                    onCancel={() => { this.infoVisible = false; }}
                >
                    <Row style={{ marginBottom: '15px' }}>
                        <Col span={10}>交易金额（元）：</Col>
                        <Col>{this.info.amount}</Col>
                    </Row>
                    <Row style={{ marginBottom: '15px' }}>
                        <Col span={10}>手续费（元）：</Col>
                        <Col>{this.info.serviceCharge}</Col>
                    </Row>
                    <Row style={{ marginBottom: '15px' }}>
                        <Col span={10}>实际到账金额（元）：</Col>
                        <Col>{this.info.actualAmount}</Col>
                    </Row>
                    <Row>
                        <Col span={10}>手机验证码（已发送到{this.info.phone}）：</Col>
                        <Col span={12}><Input style={{ width: 120 }} value={this.verifyCode} onChange={(e) => this.verifyCode = e.target.value} /></Col>
                    </Row>
                </Modal>
            </div>
        );
    }
}
const RechargeView: any = Form.create()(Recharge);
interface WithdrawPropsType {
    withdrawVisible: boolean;
    withdrawCancel: any;
    bankList: any[];
    balance: string | number;
    form?: any;
    payType: string | number;
}

@observer
class Withdraw extends React.Component<WithdrawPropsType, any> {
    @observable private loading: boolean = false;
    constructor(props: any) {
        super(props);
    }
    submit() {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.loading = true;
                const json: any = {
                    amount: values.amount,
                    bankAccountId: values.bankAccountId,
                    payType: this.props.payType,
                };
                mutate<{}, any>({
                    url: '/api/admin/payment/withdraw',
                    method: 'post',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.success('操作成功');
                        this.props.withdrawCancel(true);
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
        // const verifyCode = <div><Input style={{width: 100, marginRight: '20px'}} /><Button onClick={() => this.getVerify()}>获取校验码</Button></div>
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '可用余额', hasFeedback: true }, key: 'amo', component: <span>{this.props.balance}</span> },
            { itemProps: { label: '提现余额' }, key: 'amount', type: 'input' },
            { itemProps: { label: '选择银行卡' }, key: 'bankAccountId', type: 'select', options: this.props.bankList },
        ];
        return (
            <div>
                <Modal
                    visible={this.props.withdrawVisible}
                    title='提现'
                    onOk={() => this.submit()}
                    onCancel={() => { this.props.withdrawCancel(); }}
                >
                    <Spin spinning={this.loading}>
                        <BaseForm form={this.props.form} item={formItem} />
                    </Spin>
                </Modal>
            </div>
        );
    }
}
const WithdrawView: any = Form.create()(Withdraw);

@observer
class Account extends React.Component<any, any> {
    private tableRef: TableList;
    @observable private loading: boolean = false;
    @observable private amountWarn: string = '';
    @observable private amount: string = '';
    @observable private warnEdit: boolean = false;
    @observable private amountWarnValue: string = '';
    @observable private capitalId: string = '';
    @observable private rechargeVisible: boolean = false;
    @observable private rechargePayType: string | number = '';
    @observable private withdrawPayType: string | number = '';
    @observable private payTypeList: any[] = [];
    @observable private withdrawVisible: boolean = false;
    @observable private bankList: any[] = [];
    @observable private balance: string | number = '';
    constructor(props: any) {
        super(props);
    }
    async componentDidMount() {
        mutate<{}, any>({
            url: '/api/admin/payment/record',
            method: 'get',
            // variables: json,
        }).then((r: any) => {
            this.capitalId = r.data.list[0].id;
            this.amountWarn = r.data.list[0].warning_amount;
            this.amountWarnValue = r.data.list[0].warning_amount;
            this.amount = r.data.list[0].balance;
        });
    }
    beforeRequest(data: any) {
        const json: any = data;
        if (data.date && data.date.length > 0) {
            json.start_date = data.date[0].format('YYYY-MM-DD');
            json.end_date = data.date[1].format('YYYY-MM-DD');
            delete json.date;
        }
        return json;
    }
    async saveWarn(id: number | string, value: number | string, data: any) {
        const json = {
            capitalId: id,
            warningAmount: +value,
        };
        const res: any = await mutate<{}, any>({
            url: '/api/admin/payment/warning',
            method: 'put',
            variables: json,
        });
        this.loading = false;
        if (res.status_code === 200) {
            message.success('操作成功');
            data.warnEdit = false;
            data.warning_amount = data.amountWarnValue;
        } else {
            message.error(res.message);
        }
    }
    async getBankInfo(payType: string) {
        const json = {
            payType,
        };
        const res: any = await mutate<{}, any>({
            url: '/api/admin/payment/rechargeinfo',
            method: 'post',
            variables: json,
        });
        if (res.status_code === 200) {
            const arr = [];
            for (const i of Object.keys(res.data.bankCardList)) {
                arr.push({ label: res.data.bankCardList[i], value: i });
            }
            this.bankList = arr;
            this.balance = res.data.cash_amount;
        }
    }
    rechargeCard(data: any) {
        this.rechargePayType = data.pay_type;
        this.rechargeVisible = true;
        this.getBankInfo(data.pay_type);
    }
    withdraw(data: any) {
        this.withdrawPayType = data.pay_type;
        this.withdrawVisible = true;
        this.getBankInfo(data.pay_type);
    }
    render() {
        const columns = [
            { title: '账户', key: 'name', dataIndex: 'name' },
            { title: '账户余额', key: 'balance', dataIndex: 'balance' },
            { title: '可用余额', key: 'cash_amount', dataIndex: 'cash_amount' },
            {
                title: '预警金额', key: 'warning_amount', dataIndex: 'warning_amount', render: (value: string | number, data: any) => {
                    return (<div>
                        {
                            !data.warnEdit ? <span>{value}<a style={{ marginLeft: '15px' }} onClick={() => { data.warnEdit = true; data.amountWarnValue = value; }}>编辑</a></span>
                                :
                                <span>
                                    <Input style={{ width: '60px', marginRight: '15px' }} value={data.amountWarnValue}
                                        onChange={(e) => data.amountWarnValue = e.target.value} />
                                    <a style={{ marginRight: '15px' }} onClick={() => this.saveWarn(data.id, data.amountWarnValue, data)}>保存</a>
                                    <a onClick={() => {
                                        data.warnEdit = false;
                                        data.amountWarnValue = value;
                                    }}>取消</a>
                                </span>
                        }
                    </div>);
                },
            },
            {
                title: '操作', key: 'query_charge', render: (data: any) => {
                    return <div>
                        <a style={{ marginRight: '15px' }} onClick={() => { this.rechargeCard(data); }}>充值</a>
                        {
                            +data.pay_type === 7 ? <a style={{marginRight: '15px'}} onClick={() => {
                                this.withdraw(data);
                            }}>提现</a> : null
                        }
                        <Link style={{ marginRight: '15px' }} to={'/management/consumption/payOrder/list/' + data.pay_type} >流水明细</Link>
                        <Link to={'/management/consumption/payOrder/history/' + data.pay_type}>充值订单</Link>
                    </div>;
                },
            },
        ];
        const component = (
            <div>
                <SearchTable
                    ref={(ref) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/payment/record'
                    tableProps={{ columns }}
                    listKey={'list'}
                    beforeRequest={(data) => this.beforeRequest(data)}
                />
            </div>
        );
        const content = <Title>
            <CardClass title={'账户余额'} content={component} />
            <RechargeView
                balance={this.balance}
                bankList={this.bankList}
                payType={this.rechargePayType}
                rechargeVisible={this.rechargeVisible}
                rechargeCancel={(refresh?: boolean) => { this.rechargeVisible = false; refresh && this.tableRef.getQuery().refresh(); }} />
            <WithdrawView
                balance={this.balance}
                bankList={this.bankList}
                payType={this.withdrawPayType}
                withdrawVisible={this.withdrawVisible}
                withdrawCancel={(refresh?: boolean) => { this.withdrawVisible = false; refresh && this.tableRef.getQuery().refresh(); }} />
        </Title>;
        return (
            <Switch>
                <Route exact path='/management/consumption/payOrder/list/:payType' component={list} />
                <Route exact path='/management/consumption/payOrder/history/:payType' component={history} />
                <Route render={() => content} />
            </Switch>
        );
    }
}
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;
