import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Collapse } from 'common/antd/collapse';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { mutate, Querier } from 'common/component/restFull';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { WithAppState, withAppState } from 'operatePlat/common/appStateStore';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
const FormItem = Form.Item;

interface Props {
    form: WrappedFormUtils;
}

@Radium
@observer
export class EditView extends React.Component<RouteComponentProps<any> & WithAppState & Props, {}> {
    query: Querier<any, any> = new Querier(null);
    rolesQuery: Querier<any, any> = new Querier(null);
    disposers: Array<() => void> = [];

    @observable private resultData?: any = {};
    @observable private loading?: boolean = false;

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        this.disposers.push(autorun(() => {
            this.query.setReq({
                url: `/api/crm/companys/${this.props.match.params.id}/configs`,
                method: 'get',
            });
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || {};
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    getPanel = () => {
        const expensesItem: Array<TypeFormItem | ComponentFormItem> = [
            { type: 'inputNumber', key: 'face_query_cost', itemProps: { label: '人脸对比查询费用' }, initialValue: this.resultData.face_query_cost, required: true },
            { type: 'inputNumber', key: 'operator_b_query_cost', itemProps: { label: '运营商B查询费' }, initialValue: this.resultData.operator_b_query_cost, required: true },
            { type: 'inputNumber', key: 'taobao_d_query_cost', itemProps: { label: '淘宝D查询费' }, initialValue: this.resultData.taobao_d_query_cost, required: true },
            { type: 'inputNumber', key: 'sms_cost', itemProps: { label: '短信费用' }, initialValue: this.resultData.sms_cost, required: true },
            { type: 'inputNumber', key: 'sign_contract_cost', itemProps: { label: '合同查询计费' }, initialValue: this.resultData.sign_contract_cost, required: true },
            { type: 'inputNumber', key: 'risk_model_cost', itemProps: { label: '风控模型费用' }, initialValue: this.resultData.risk_model_cost, required: true },
            { type: 'inputNumber', key: 'platform_p_query_cost', itemProps: { label: '平台P查询费' }, initialValue: this.resultData.platform_p_query_cost, required: true },
            { type: 'inputNumber', key: 'platform_t_query_cost', itemProps: { label: '平台T查询费' }, initialValue: this.resultData.platform_t_query_cost, required: true },
            { type: 'inputNumber', key: 'platform_xy_cs_radar_query_cost', itemProps: { label: '平台XY-催收雷达查询费' }, initialValue: this.resultData.platform_xy_cs_radar_query_cost, required: true },
            { type: 'inputNumber', key: 'platform_xy_qj_radar_query_cost', itemProps: { label: '平台XY-全景雷达查询费' }, initialValue: this.resultData.platform_xy_qj_radar_query_cost, required: true },
        ];

        const payConfigItem: Array<TypeFormItem | ComponentFormItem> = [
            {
                type: 'select',
                key: 'allow_payment',
                itemProps: {
                    label: '支付权限',
                },
                initialValue: this.resultData.allow_payment,
                required: true,
                options: [
                    {
                        label: '允许',
                        value: 1,
                    },
                    {
                        label: '不允许',
                        value: 0,
                    },
                ],
            },
            {
                type: 'select',
                key: 'allow_manual_deduct_handling_fee',
                itemProps: {
                    label: '手动扣除手续费',
                },
                initialValue: this.resultData.allow_manual_deduct_handling_fee,
                required: true,
                options: [
                    {
                        label: '有权限',
                        value: 1,
                    },
                    {
                        label: '无权限',
                        value: 0,
                    },
                ],
            },
        ];

        const baofuOpen = this.props.form.getFieldValue('baofu.open') !== undefined ?
            this.props.form.getFieldValue('baofu.open') : _.get(this.resultData, 'baofu.open');
        const weidaiOpen = this.props.form.getFieldValue('weidai.open') !== undefined ?
            this.props.form.getFieldValue('weidai.open') : _.get(this.resultData, 'weidai.open');

        const payChannelConfigItem: Array<TypeFormItem | ComponentFormItem> = [
            {
                type: 'switch',
                key: 'baofu.open',
                itemProps: {
                    label: '宝付',
                },
                initialValue: !!_.get(this.resultData, 'baofu.open'),
                fieldDecoratorOptions: {
                    valuePropName: 'checked',
                },
                options: [
                    {
                        label: '开启',
                        value: 1,
                    },
                    {
                        label: '关闭',
                        value: 0,
                    },
                ],
            },
            {
                type: 'select',
                key: 'baofu.daikou.type',
                itemProps: {
                    label: '支付手续费收取方式',
                },
                initialValue: _.get(this.resultData, 'baofu.daikou.type'),
                required: true,
                hide: !baofuOpen,
                options: [
                    {
                        label: '固定金额',
                        value: 'fixed',
                    },
                    {
                        label: '比例',
                        value: 'percent',
                    },
                ],
            },
            {
                type: 'inputNumber',
                key: 'baofu.daikou.fee',
                itemProps: {
                    label: '金额/比例',
                },
                initialValue: _.get(this.resultData, 'baofu.daikou.fee'),
                required: true,
                hide: !baofuOpen,
            },
            {
                type: 'inputNumber',
                key: 'baofu.daikou.min',
                itemProps: {
                    label: '支付手续费最低金额',
                },
                initialValue: _.get(this.resultData, 'baofu.daikou.min'),
                required: true,
                hide: !baofuOpen,
            },
            {
                type: 'select',
                key: 'baofu.daifu.type',
                itemProps: {
                    label: '代付手续费收取方式',
                },
                initialValue: _.get(this.resultData, 'baofu.daifu.type'),
                required: true,
                hide: !baofuOpen,
                options: [
                    {
                        label: '固定金额',
                        value: 'fixed',
                    },
                    {
                        label: '比例',
                        value: 'percent',
                    },
                ],
            },
            {
                type: 'inputNumber',
                key: 'baofu.daifu.fee',
                itemProps: {
                    label: '金额/比例',
                },
                initialValue: _.get(this.resultData, 'baofu.daifu.fee'),
                required: true,
                hide: !baofuOpen,
            },
            {
                type: 'inputNumber',
                key: 'baofu.daifu.min',
                itemProps: {
                    label: '代付手续费最低金额',
                },
                initialValue: _.get(this.resultData, 'baofu.daifu.min'),
                required: true,
                hide: !baofuOpen,
            },
            {
                type: 'select',
                key: 'baofu.offline.type',
                itemProps: {
                    label: '大额手续费收取方式',
                },
                initialValue: _.get(this.resultData, 'baofu.offline.type'),
                required: true,
                hide: !baofuOpen,
                options: [
                    {
                        label: '固定金额',
                        value: 'fixed',
                    },
                    {
                        label: '比例',
                        value: 'percent',
                    },
                ],
            },
            {
                type: 'inputNumber',
                key: 'baofu.offline.fee',
                itemProps: {
                    label: '金额/比例',
                },
                initialValue: _.get(this.resultData, 'baofu.offline.fee'),
                required: true,
                hide: !baofuOpen,
            },
            {
                type: 'inputNumber',
                key: 'baofu.offline.min',
                itemProps: {
                    label: '大额手续费最低金额',
                },
                initialValue: _.get(this.resultData, 'baofu.offline.min'),
                required: true,
                hide: !baofuOpen,
            },
            {
                type: 'switch',
                key: 'weidai.open',
                itemProps: {
                    label: '委贷',
                },
                initialValue: !!_.get(this.resultData, 'weidai.open'),
                fieldDecoratorOptions: {
                    valuePropName: 'checked',
                },
                options: [
                    {
                        label: '开启',
                        value: 1,
                    },
                    {
                        label: '关闭',
                        value: 0,
                    },
                ],
            },
            {
                type: 'select',
                key: 'weidai.daikou.type',
                itemProps: {
                    label: '支付手续费收取方式',
                },
                initialValue: _.get(this.resultData, 'weidai.daikou.type'),
                required: true,
                hide: !weidaiOpen,
                options: [
                    {
                        label: '固定金额',
                        value: 'fixed',
                    },
                    {
                        label: '比例',
                        value: 'percent',
                    },
                ],
            },
            {
                type: 'inputNumber',
                key: 'weidai.daikou.fee',
                itemProps: {
                    label: '金额/比例',
                },
                initialValue: _.get(this.resultData, 'weidai.daikou.fee'),
                required: true,
                hide: !weidaiOpen,
            },
            {
                type: 'inputNumber',
                key: 'weidai.daikou.min',
                itemProps: {
                    label: '支付手续费最低金额',
                },
                initialValue: _.get(this.resultData, 'weidai.daikou.min'),
                required: true,
                hide: !weidaiOpen,
            },
            {
                type: 'select',
                key: 'weidai.daifu.type',
                itemProps: {
                    label: '代付手续费收取方式',
                },
                initialValue: _.get(this.resultData, 'weidai.daifu.type'),
                required: true,
                hide: !weidaiOpen,
                options: [
                    {
                        label: '固定金额',
                        value: 'fixed',
                    },
                    {
                        label: '比例',
                        value: 'percent',
                    },
                ],
            },
            {
                type: 'inputNumber',
                key: 'weidai.daifu.fee',
                itemProps: {
                    label: '金额/比例',
                },
                initialValue: _.get(this.resultData, 'weidai.daifu.fee'),
                required: true,
                hide: !weidaiOpen,
            },
            {
                type: 'inputNumber',
                key: 'weidai.daifu.min',
                itemProps: {
                    label: '代付手续费最低金额',
                },
                initialValue: _.get(this.resultData, 'weidai.daifu.min'),
                required: true,
                hide: !weidaiOpen,
            }, {
                type: 'select',
                key: 'weidai.offline.type',
                itemProps: {
                    label: '大额支付手续费收取方式',
                },
                initialValue: _.get(this.resultData, 'weidai.offline.type'),
                required: true,
                hide: !weidaiOpen,
                options: [
                    {
                        label: '固定金额',
                        value: 'fixed',
                    },
                    {
                        label: '比例',
                        value: 'percent',
                    },
                ],
            },
            {
                type: 'inputNumber',
                key: 'weidai.offline.fee',
                itemProps: {
                    label: '金额/比例',
                },
                initialValue: _.get(this.resultData, 'weidai.offline.fee'),
                required: true,
                hide: !weidaiOpen,
            },
            {
                type: 'inputNumber',
                key: 'weidai.offline.min',
                itemProps: {
                    label: '大额支付手续费最低金额',
                },
                initialValue: _.get(this.resultData, 'weidai.offline.min'),
                required: true,
                hide: !weidaiOpen,
            },
        ];

        const smsConfigItem: Array<TypeFormItem | ComponentFormItem> = [
            { type: 'input', key: 'sms_signature', itemProps: { label: '短信签名' }, initialValue: this.resultData.sms_signature, required: true },
            {
                type: 'selectMulti',
                key: 'auto_deduction',
                itemProps: {
                    label: '还款代扣扣款时间',
                },
                initialValue: this.resultData.auto_deduction,
                required: true,
                options: [
                    {
                        label: '上午九点',
                        value: 9,
                    },
                    {
                        label: '下午三点',
                        value: 15,
                    },
                ],
            },
        ];
        return [
            { header: '查询费用金额', item: expensesItem },
            { header: '支付配置', item: payConfigItem },
            { header: '支付通道配置', item: payChannelConfigItem },
            { header: '短信配置', item: smsConfigItem },
        ];
    }

    render() {
        const panel = this.getPanel();
        return (
            <Spin spinning={this.loading}>
                <div style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    padding: 24,
                }}>
                    修改公司配置项
                </div>
                <Collapse defaultActiveKey={_.keys(panel)}>
                    {
                        panel.map((r, i) => {
                            return (
                                <Collapse.Panel header={r.header} key={`${i}`}>
                                    <BaseForm form={this.props.form} item={r.item} />
                                </Collapse.Panel>
                            );
                        })
                    }
                </Collapse>
                <BaseForm style={{ margin: '20px 0' }} form={this.props.form} item={[
                    {
                        formItem: false, component: this.subBtn(),
                    },
                ]} onSubmit={this.handleSubmit} />
            </Spin>
        );
    }

    private handleSubmit = (ev: any) => {
        ev.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.loading = true;
                const json: any = _.assign({}, values);
                json.baofu.open = json.baofu.open ? 1 : 0;
                json.weidai.open = json.weidai.open ? 1 : 0;

                mutate<{}, any>({
                    url: `/api/crm/companys/${this.props.match.params.id}/configs`,
                    method: 'put',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.info('操作成功', 0.5, () => {
                            this.props.history.push(`/operatePlat/company`);
                        });

                        return;
                    }
                    message.warn(r.message);
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

    private subBtn = (): JSX.Element => {
        return (
            <FormItem
                wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 19, offset: 5 },
                }}>
                <Button type='primary' htmlType='submit'>确定</Button>
                <Button
                    style={{ margin: '0 0 0 10px' }}
                    onClick={() => { this.props.history.push(`/operatePlat/company`); }}>取消</Button>
            </FormItem>
        );
    }
}

const formCreate = Form.create()(withRouter(withAppState(EditView)));

export const Edit = formCreate;
