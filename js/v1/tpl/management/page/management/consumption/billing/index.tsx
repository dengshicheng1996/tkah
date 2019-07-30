import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import {mutate, Querier} from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import * as $ from 'jquery';
import * as _ from 'lodash';
import { observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import Title from '../../../../common/TitleComponent';

@observer
class Account extends React.Component<any, {}> {
    private tableRef: TableList;
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];
    @observable private visible: boolean = false;
    @observable private consume: any[] = [];
    @observable private source: any[] = [];
    @observable private editId: string = '';
    @observable private loading: boolean = false;
    @observable private amountWarn: string = '';
    @observable private amount: string = '';
    @observable private warnEdit: boolean = false;
    @observable private amountWarnValue: string = '';
    @observable private chargeModalVisible: boolean;
    @observable private chargeTypeInitValue: string = '';
    @observable private rechargeinfo: [{ label: string, value: string }];
    @observable private isPayVisible: boolean = false;

    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        this.getAmount();
    }
    getAmount() {
        mutate<{}, any>({
            url: '/api/admin/payment/selectrecord',
            method: 'get',
        }).then((r: any) => {
            this.amountWarn = r.data.warning_amount;
            this.amountWarnValue = r.data.warning_amount;
            this.amount = r.data.query_charge;
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
    add() {
        this.editId = '';
        this.visible = true;
    }
    edit(data: any) {
        this.editId = data.id;
        this.visible = true;
    }
    submit() {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                mutate<{}, any>({
                    url: '/api/admin/payment/chargeSelect',
                    method: 'post',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.success('操作成功');
                        this.visible = false;
                        this.tableRef.getQuery().refresh();
                        this.props.form.resetFields();
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
        });
    }
    async saveWarn() {
        const json = {
            warningAmount: +this.amountWarnValue,
        };
        const res: any = await mutate<{}, any>({
            url: '/api/admin/payment/selectwarning',
            method: 'post',
            variables: json,
        });
        this.loading = false;
        if (res.status_code === 200) {
            message.success('操作成功');
            this.warnEdit = false;
            this.getAmount();
        } else {
            message.error(res.message);
        }
    }

    render() {
        const columns = [
            { title: '流水编号', key: 'id', dataIndex: 'id' },
            { title: '金额', key: 'amount', dataIndex: 'amount' },
            { title: '交易类型', key: 'type_name', dataIndex: 'type_name' },
            { title: '交易时间', key: 'created_at', dataIndex: 'created_at' },
            { title: '余额', key: 'query_charge', dataIndex: 'query_charge' },
            { title: '消费数据源', key: 'source_name', dataIndex: 'source_name' },
            { title: '操作人', key: 'remark', dataIndex: 'remark' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '交易类型', hasFeedback: false }, initialValue: '-1',
                typeComponentProps: { placeholder: '交易类型' }, key: 'type', type: 'select', options: [{ label: '全部', value: '-1' }, { label: '消费', value: '2' }, { label: '充值', value: '1' }, { label: '模型补贴', value: '3' }] },
            { itemProps: { label: '交易时间', hasFeedback: false },
                typeComponentProps: { placeholder: ['开始时间', '结束时间'] }, key: 'date', type: 'rangePicker' },
            { itemProps: { label: '消费数据源', hasFeedback: false }, initialValue: '-1',
                typeComponentProps: { placeholder: '消费数据源' },
                key: 'source', type: 'select',
                options: [
                    { label: '全部', value: '-1' },
                    { label: '短信', value: '1' },
                    { label: '运营商-数据源B', value: '2' },
                    { label: '淘宝-数据源D', value: '3' },
                    { label: '人脸对比', value: '4' },
                    { label: '合同', value: '5' },
                ] },
            { itemProps: { label: '操作人', hasFeedback: false },
                typeComponentProps: { placeholder: '操作人' }, key: 'remark', type: 'input' },
        ];
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '金额' }, key: 'amount', type: 'input' },
            { itemProps: { label: '支付方式' }, key: 'chargeType', type: 'select', options: [{ label: '支付宝', value: '2' }] },
            { itemProps: { label: '备注' }, key: 'remark', type: 'input' },
        ];

        const component = [
            <div style={{ padding: '20px' }}>
                <span style={{ fontSize: '22px', marginRight: '30px' }}>查询费余额：
                    <span style={{ fontSize: '18px', color: 'red', marginLeft: '20px' }}>{this.amount} <span style={{ fontSize: '14px', color: '#333', marginLeft: '10px' }}>元</span> </span>
                    <Button type='primary' style={{ marginLeft: '15px' }} onClick={ () => this.handleShowChargeModal() }>充值</Button>
                    { this.handleChargeBtnModal() }
                </span>
                { this.handleIsPaySuccessModal() }
                <span>余额预警：
                    {
                        !this.warnEdit ? <span>{this.amountWarn}<a style={{ marginLeft: '15px' }} onClick={() => this.warnEdit = true}>编辑</a></span>
                            :
                            <span>
                                <Input style={{ width: '60px', marginRight: '15px' }} value={this.amountWarnValue} onChange={(e) => this.amountWarnValue = e.target.value} />
                                <a style={{ marginRight: '15px' }} onClick={() => this.saveWarn()}>保存</a>
                                <a onClick={() => { this.warnEdit = false; this.amountWarnValue = this.amountWarn; }}>取消</a>
                            </span>
                    }
                </span>
            </div>,
            <div>
                <SearchTable
                    wrappedComponentRef={(ref: TableList) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/consume/companycost'
                    tableProps={{ columns }}
                    query={{ search }}
                    listKey={'data'}
                    beforeRequest={(data) => this.beforeRequest(data)}
                />
                <Modal
                    visible={this.visible}
                    title='查询费充值'
                    onOk={() => this.submit()}
                    onCancel={() => { this.visible = false; this.props.form.resetFields(); }}
                >
                    <BaseForm form={this.props.form} item={formItem} />
                </Modal>
            </div>,
        ];
        return (
            <Title component={component} />
        );
    }

    private handleShowChargeModal() {
        this.rechargeinfo = [
            {
                label: '支付宝',
                value: '6',
            },
        ];
        this.chargeTypeInitValue = this.rechargeinfo[0].value;
        this.chargeModalVisible = true;
    }

    private handleChargeSuccess() {
        this.props.form.validateFields((err: any, values: any) => {
            if (err) { return; }
            const json = {
                amount: values.amount,
                pay_type: values.MethodPayment,
            };
            mutate<{}, any>({
                url: '/api/admin/payment/recharge/inquiry',
                method: 'post',
                variables: json,
            }).then(r => {
                this.loading = false;
                if (r.status_code === 200) {
                    this.chargeModalVisible = false;
                    const str = r.data.replace('<form', '<form target=_blank');
                    const id = $('#alipaysubmit');
                    if (id) { id.remove(); }
                    $('body').append(str);
                    this.isPayVisible = true;
                    this.props.form.resetFields();
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
        });
    }

    private handlePaySuccess() {
        this.isPayVisible = false;
        this.getAmount();
        this.tableRef.getQuery().refresh();
    }

    private handleChargeBtnModal() {
        const chargeFromItem: Array<TypeFormItem | ComponentFormItem> = [
            {
                key: 'amount',
                type: 'input',
                itemProps: { label: '金额' },
                required: true,
                typeComponentProps: {
                    placeholder: '最低1000起充',
                },
                fieldDecoratorOptions: {
                    rules: [
                        {
                            validator(rule, value, callback) {
                                const num = parseFloat(value);
                                if (isNaN(num)) { return callback('请输入数字类型'); }
                                if (num < 1000) { return callback('充值金额最低为1000元'); }
                                callback();
                            },
                        },
                        {
                            required: true,
                            message: '金额不能少于1000',
                        },
                    ],
                },
            },
            {
                key: 'MethodPayment',
                type: 'select',
                itemProps: {
                    label: '支付方式',
                },
                required: true,
                initialValue: this.chargeTypeInitValue,
                options: this.rechargeinfo,
            },
        ];

        return (
            <Modal
                title='查询费充值'
                visible={this.chargeModalVisible}
                onOk={() => this.handleChargeSuccess()}
                onCancel={() => { this.chargeModalVisible = false; this.props.form.resetFields(); }}
            >
                <BaseForm form={ this.props.form } item={ chargeFromItem } />
            </Modal>
        );
    }

    private handleIsPaySuccessModal() {
        return (
            <Modal
                title='充值结果'
                visible={this.isPayVisible}
                cancelText='取消'
                okText='充值成功'
                onOk={() => this.handlePaySuccess()}
                onCancel={() => { this.isPayVisible = false; }}
            >
                <p>您是否充值成功？</p>
            </Modal>
        );
    }
}
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;
