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

@observer
class SettleComponent extends React.Component<any, any> {
    @observable private loading: boolean = false;
    @observable private bankList: any[] = [];
    @observable private channelList: any[] = [];
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
            const bank = res.data.bank;
            this.bankList = bank.map((item: any) => {
                return {label: item.bank_name + item.bank_num, value: item.id};
            });
            this.channelList = res.data.channel;
        }
    }
    settle() {
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                json.id = this.props.id;
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
        this.props.form.setFieldsValue({ content: ''});
        this.props.cancel();
    }
    render() {
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '扣除费用' }, initialValue: '', key: 'content', type: 'input' },
            { itemProps: { label: '银行卡' }, initialValue: '', key: 'content', type: 'select', options: this.bankList },
            { itemProps: { label: '通道' }, initialValue: '', key: 'content', type: 'select', options: this.channelList },
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
        this.props.form.setFieldsValue({ content: ''});
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
export default class Condition extends React.Component<any, any> {
    @observable private settleVisible: boolean = false;
    @observable private deductVisible: boolean = false;
    constructor(props: any) {
        super(props);
    }
    render() {
        const conditionColumn = [
            { title: '金额', key: 'service_charge', dataIndex: 'period_amount' },
            { title: '已还金额', key: 'repaid_fee', dataIndex: 'repaid_fee' },
            { title: '状态', key: 'clear_status_text', dataIndex: 'clear_status_text' },
            { title: '操作', key: 'set', render: (data: any) => {
                    return <div>
                        <Button type={'primary'} onClick={() => this.settleVisible = true}>扣除费用</Button>
                        <a onClick={() => this.deductVisible = true} style={{marginLeft: '15px'}}>结清</a>
                    </div>;
                } },
        ];
        const condition = <div>
            <Table rowKey={'id'} columns={conditionColumn} dataSource={this.props.data || []} pagination={false} />
        </div>;
        console.log(this.props.customerId);
        return (
            <div>
                <CardClass title={'手续费还款情况'} content={condition}/>
                <Settle customerId={this.props.customerId} cancel={() => this.settleVisible = false} settleVisible={this.settleVisible} onOk={() => {console.log(123); }}/>
                <Deduct serviceChargeId={this.props.serviceChargeId} cancel={() => this.deductVisible = false} deductVisible={this.deductVisible} onOk={() => {console.log(123); }} />
            </div>
        );
    }
}
