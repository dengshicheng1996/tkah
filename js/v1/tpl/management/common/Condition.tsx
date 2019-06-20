import {Button} from 'common/antd/button';
import {Form} from 'common/antd/form';
import {message} from 'common/antd/message';
import {Modal} from 'common/antd/modal';
import {Spin} from 'common/antd/spin';
import { Table } from 'common/antd/table';
import {mutate} from 'common/component/restFull';
import {BaseForm, ComponentFormItem, TypeFormItem} from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import CardClass from './CardClass';
import { withAppState } from './appStateStore';
declare const window: any;
@observer
class SettleComponent extends React.Component<any, any> {
    @observable private loading: boolean = false;
    @observable private bankList: any[] = [];
    @observable private channelList: any[] = [];
    @observable private initBankValue: number|string;
    constructor(props: any) {
        super(props);
    }
    async componentDidMount() {
        const json = {
            customer_id: this.props.customerId,
        };
        const res: any = await mutate<{}, any>({
            url: '/api/admin/customer/payment/channel',
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
            const bank = res.data.bank || [];
            this.bankList = bank.map((item: any) => {
                if (item.last_used_by_tx === 1) {
                    this.initBankValue = item.id;
                }
                return {label: item.bank_name + item.bank_num, value: item.id};
            });
            this.channelList = res.data.channel;
        }
    }
    settle() {
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                json.service_charge_id = this.props.serviceChargeId;
                this.loading = true;
                const res: any = await mutate<{}, any>({
                    url: '/api/admin/afterloan/repay/fee',
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
        this.props.form.resetFields();
        this.props.cancel();
    }
    render() {
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '扣除费用' }, initialValue: this.props.initMoney, key: 'money', type: 'input' },
            { itemProps: { label: '银行卡' }, initialValue: this.initBankValue, key: 'bank_id', type: 'select', options: this.bankList },
            { itemProps: { label: '通道' }, initialValue: '', key: 'payment_channel', type: 'select', options: this.channelList },
        ];
        return (<Modal
            title={'扣除费用'}
            visible={this.props.settleVisible}
            onOk={() => this.settle()}
            onCancel={() => this.cancel()}
        >
            <Spin spinning={this.loading}>
                <BaseForm item={formItem} form={this.props.form} />
            </Spin>
        </Modal>);
    }
}
const Settle: any = Form.create()(SettleComponent);

@observer
class DeductComponent extends React.Component<any, any> {
    @observable private loading: boolean = false;
    constructor(props: any) {
        super(props);
    }
    deduct() {
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                json.service_charge_id = this.props.serviceChargeId;
                this.loading = true;
                const res: any = await mutate<{}, any>({
                    url: '/api/admin/afterloan/fee/clear',
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
        this.props.form.setFieldsValue({ money: ''});
        this.props.cancel();
    }
    render() {
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '金额' }, initialValue: '', key: 'money', type: 'input' },
        ];
        return (<Modal
            title={'结清金额'}
            visible={this.props.deductVisible}
            onOk={() => this.deduct()}
            onCancel={() => this.cancel()}
        >
            <Spin spinning={this.loading}>
                <BaseForm item={formItem} form={this.props.form} />
            </Spin>
        </Modal>);
    }
}
const Deduct: any = Form.create()(DeductComponent);

@observer
class Condition extends React.Component<any, any> {
    @observable private settleVisible: boolean = false;
    @observable private deductVisible: boolean = false;
    constructor(props: any) {
        super(props);
    }
    render() {
        console.log(this.props);
        const {companyInfo = {config: {}}} = this.props.data.appState;
        const conditionColumn = [
            { title: '金额', key: 'service_charge_amount', dataIndex: 'service_charge_amount' },
            { title: '已还金额', key: 'pay_service_charge_amount', dataIndex: 'pay_service_charge_amount' },
            { title: '状态', key: 'status_text', dataIndex: 'status_text' },
            { title: '操作', key: 'set', render: (data: any) => {
                    return  data.status === 3 ? '' : <div>
                        {
                            companyInfo.config.allow_manual_deduct_handling_fee ? <Button type={'primary'} onClick={() => this.settleVisible = true}>扣除费用</Button> : ''
                        }
                        <a onClick={() => this.deductVisible = true} style={{marginLeft: '15px'}}>结清</a>
                    </div>;
                } },
        ];
        const condition = <div>
            <Table rowKey={'id'} columns={conditionColumn} dataSource={this.props.dataSource || []} pagination={false} />
        </div>;
        return (
            <div>
                <CardClass title={'手续费还款情况'} content={condition}/>
                <Settle
                    serviceChargeId={this.props.serviceChargeId}
                    customerId={this.props.customerId}
                    cancel={() => this.settleVisible = false}
                    settleVisible={this.settleVisible}
                    initMoney={this.props.dataSource[0].no_pay_service_charge_amount}
                    onOk={() => {this.props.onOk(); }}/>
                <Deduct
                    serviceChargeId={this.props.serviceChargeId}
                    cancel={() => this.deductVisible = false}
                    deductVisible={this.deductVisible}
                    onOk={() => {this.props.onOk(); }} />
            </div>
        );
    }
}
export default withAppState(Condition);
