import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Collapse } from 'common/antd/collapse';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
import { mutate, Querier } from 'common/restFull';
import * as _ from 'lodash';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as moment from 'moment';
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

    render() {
        const expensesItem: BaseFormItem[] = [
            { type: 'inputNumber', key: 'face_query_cost', label: '人脸对比查询费用', initialValue: this.resultData.face_query_cost, required: true },
            { type: 'inputNumber', key: 'operator_b_query_cost', label: '运营商B查询费', initialValue: this.resultData.operator_b_query_cost, required: true },
            { type: 'inputNumber', key: 'taobao_d_query_cost', label: '淘宝D查询费', initialValue: this.resultData.taobao_d_query_cost, required: true },
            { type: 'inputNumber', key: 'sms_cost', label: '短信费用', initialValue: this.resultData.sms_cost, required: true },
            { type: 'inputNumber', key: 'risk_model_cost', label: '风控模型费用', initialValue: this.resultData.risk_model_cost, required: true },
            { type: 'inputNumber', key: 'platform_p_query_cost', label: '平台P查询费', initialValue: this.resultData.platform_p_query_cost, required: true },
            { type: 'inputNumber', key: 'platform_t_query_cost', label: '平台T查询费', initialValue: this.resultData.platform_t_query_cost, required: true },
            { type: 'inputNumber', key: 'platform_xy_cs_radar_query_cost', label: '平台XY-催收雷达查询费', initialValue: this.resultData.platform_xy_cs_radar_query_cost, required: true },
            { type: 'inputNumber', key: 'platform_xy_qj_radar_query_cost', label: '平台XY-全景雷达查询费', initialValue: this.resultData.platform_xy_qj_radar_query_cost, required: true },
            {
                type: 'input',
                key: 'mobile',
                label: '主账号',
                initialValue: this.resultData.mobile,
                rules: [
                    { required: true, message: '请输入手机号', whitespace: true },
                    {
                        validator: (rule, value, callback) => {
                            const reg = new RegExp(regular.phone_number.reg);
                            if (!reg.test(value) && value) {
                                callback('格式错误，请输入正确的手机号');
                                return;
                            }
                            callback();
                        },
                    },
                ],
            },
            {
                type: 'select',
                key: 'is_test',
                label: '是否测试公司	',
                initialValue: this.resultData.is_test,
                options: [
                    {
                        label: '是',
                        value: 1,
                    },
                    {
                        label: '否',
                        value: 0,
                    },
                ],
            },
        ];

        const payConfigItem = [
            {
                type: 'select',
                key: 'allow_payment',
                label: '支付权限',
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
                label: '手动扣除手续费',
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

        const baofuOpen = this.props.form.getFieldValue('baofu.open');
        const weidaiOpen = this.props.form.getFieldValue('weidai.open');

        const payChannelConfigItem = [
            {
                type: 'checkbox',
                key: 'baofu.open',
                label: '宝付',
                initialValue: this.resultData.baofu ? this.resultData.baofu.open : undefined,
                options: [
                    {
                        label: '开启',
                        value: 1,
                    },
                ],
            },
            {
                type: 'select',
                key: 'baofu.payment.type',
                label: '支付手续费收取方式',
                initialValue: this.resultData.baofu ? this.resultData.baofu.payment.type : undefined,
                required: true,
                hide: !(baofuOpen && baofuOpen.indexOf(1) !== -1),
                options: [
                    {
                        label: '固定金额',
                        value: 'fixed',
                    },
                    {
                        label: '比例',
                        value: 0,
                    },
                ],
            },
            {
                type: 'inputNumber',
                key: 'baofu.payment.fee',
                label: '金额/比例',
                initialValue: this.resultData.baofu ? this.resultData.baofu.payment.fee : undefined,
                required: true,
                hide: !(baofuOpen && baofuOpen.indexOf(1) !== -1),
            },
            {
                type: 'inputNumber',
                key: 'baofu.payment.min',
                label: '支付手续费最低金额',
                initialValue: this.resultData.baofu ? this.resultData.baofu.payment.min : undefined,
                required: true,
                hide: !(baofuOpen && baofuOpen.indexOf(1) !== -1),
            },
            {
                type: 'select',
                key: 'baofu.payment.type',
                label: '代付手续费收取方式',
                initialValue: this.resultData.baofu ? this.resultData.baofu.payment.type : undefined,
                required: true,
                hide: !(baofuOpen && baofuOpen.indexOf(1) !== -1),
                options: [
                    {
                        label: '固定金额',
                        value: 'fixed',
                    },
                    {
                        label: '比例',
                        value: 0,
                    },
                ],
            },
            {
                type: 'inputNumber',
                key: 'baofu.payment.fee',
                label: '金额/比例',
                initialValue: this.resultData.baofu ? this.resultData.baofu.payment.fee : undefined,
                required: true,
                hide: !(baofuOpen && baofuOpen.indexOf(1) !== -1),
            },
            {
                type: 'inputNumber',
                key: 'baofu.payment.min',
                label: '代付手续费最低金额',
                initialValue: this.resultData.baofu ? this.resultData.baofu.payment.min : undefined,
                required: true,
                hide: !(baofuOpen && baofuOpen.indexOf(1) !== -1),
            },
            {
                type: 'checkbox',
                key: 'weidai.open',
                label: '委贷',
                initialValue: this.resultData.weidai ? this.resultData.weidai.open : undefined,
                options: [
                    {
                        label: '开启',
                        value: 1,
                    },
                ],
            },
            {
                type: 'select',
                key: 'weidai.payment.type',
                label: '支付手续费收取方式',
                initialValue: this.resultData.weidai ? this.resultData.weidai.payment.type : undefined,
                required: true,
                hide: !(weidaiOpen && weidaiOpen.indexOf(1) !== -1),
                options: [
                    {
                        label: '固定金额',
                        value: 'fixed',
                    },
                    {
                        label: '比例',
                        value: 0,
                    },
                ],
            },
            {
                type: 'inputNumber',
                key: 'weidai.payment.fee',
                label: '金额/比例',
                initialValue: this.resultData.weidai ? this.resultData.weidai.payment.fee : undefined,
                required: true,
                hide: !(weidaiOpen && weidaiOpen.indexOf(1) !== -1),
            },
            {
                type: 'inputNumber',
                key: 'weidai.payment.min',
                label: '支付手续费最低金额',
                initialValue: this.resultData.weidai ? this.resultData.weidai.payment.min : undefined,
                required: true,
                hide: !(weidaiOpen && weidaiOpen.indexOf(1) !== -1),
            },
            {
                type: 'select',
                key: 'weidai.payment.type',
                label: '代付手续费收取方式',
                initialValue: this.resultData.weidai ? this.resultData.weidai.payment.type : undefined,
                required: true,
                hide: !(weidaiOpen && weidaiOpen.indexOf(1) !== -1),
                options: [
                    {
                        label: '固定金额',
                        value: 'fixed',
                    },
                    {
                        label: '比例',
                        value: 0,
                    },
                ],
            },
            {
                type: 'inputNumber',
                key: 'weidai.payment.fee',
                label: '金额/比例',
                initialValue: this.resultData.weidai ? this.resultData.weidai.payment.fee : undefined,
                required: true,
                hide: !(weidaiOpen && weidaiOpen.indexOf(1) !== -1),
            },
            {
                type: 'inputNumber',
                key: 'weidai.payment.min',
                label: '代付手续费最低金额',
                initialValue: this.resultData.weidai ? this.resultData.weidai.payment.min : undefined,
                required: true,
                hide: !(weidaiOpen && weidaiOpen.indexOf(1) !== -1),
            },
        ];

        return (
            <Spin spinning={this.loading}>
                <div style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    padding: 24,
                }}>
                    修改公司配置项
                </div>
                <Collapse defaultActiveKey={['1', '2', '3']}>
                    <Collapse.Panel header='查询费用金额' key='1'>
                        <BaseForm form={this.props.form} item={expensesItem} />
                    </Collapse.Panel>
                    <Collapse.Panel header='支付配置' key='2'>
                        <BaseForm form={this.props.form} item={payConfigItem} />
                    </Collapse.Panel>
                    <Collapse.Panel header='支付通道配置' key='3'>
                        <BaseForm form={this.props.form} item={payChannelConfigItem} />
                    </Collapse.Panel>
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
                const json: any = _.assign({}, values, {
                    expired_at: values.expired_at.format('YYYY-MM-DD'),
                });

                mutate<{}, any>({
                    url: `crm/companys/${this.props.match.params.id}/configs`,
                    method: 'put',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.info('操作成功', 1, () => {
                            this.props.history.push(`/operatePlat/companys`);
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
