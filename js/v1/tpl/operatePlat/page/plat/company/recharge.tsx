import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { mutate, Querier } from 'common/component/restFull';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
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
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];
    private kind: {
        [key: string]: {
            url: string,
            title: string,
            item: () => Array<TypeFormItem | ComponentFormItem>,
        },
    } = {
            chargefromcode: {
                url: `/api/crm/payment/${this.props.match.params.kind}`,
                title: '充值码充值',
                item: () => {
                    return [
                        { type: 'input', key: 'chargeCode', itemProps: { label: '充值验证码' }, required: true },
                        { type: 'inputNumber', key: 'amount', itemProps: { label: '充值金额' }, required: true },
                        {
                            type: 'inputNumber',
                            key: 'cardNum',
                            itemProps: { label: '银行卡后6位' },
                            required: true,
                            typeComponentProps: {
                                precision: 0,
                            },
                        },
                        {
                            formItem: false, component: this.subBtn(),
                        },
                    ];
                },
            },
            chargeselect: {
                url: `/api/crm/payment/${this.props.match.params.kind}`,
                title: '查询费充值',
                item: () => {
                    return [
                        { type: 'inputNumber', key: 'amount', itemProps: { label: '充值金额' }, required: true },
                        { type: 'textArea', key: 'remark', itemProps: { label: '备注' }, required: true },
                        {
                            formItem: false, component: this.subBtn(),
                        },
                    ];
                },
            },
            charge: {
                url: `/api/crm/payment/${this.props.match.params.kind}`,
                title: '手动充值',
                item: () => {
                    const amount: number = this.props.form.getFieldValue('amount') ? this.props.form.getFieldValue('amount') : 0;
                    return [
                        { type: 'inputNumber', key: 'amount', itemProps: { label: '充值金额' }, required: true },
                        {
                            type: 'inputNumber',
                            key: 'serviceAmount',
                            itemProps: {
                                label: '服务费',
                            },
                            typeComponentProps: {
                                max: amount - 0.01,
                            },
                            required: true,
                        },
                        {
                            type: 'select',
                            key: 'payType',
                            itemProps: { label: '充值渠道' },
                            required: true,
                            options: _.map(this.resultData, (value, key) => {
                                return {
                                    label: value,
                                    value: parseInt(key),
                                };
                            }),
                        },
                        {
                            formItem: false, component: this.subBtn(),
                        },
                    ];
                },
            },
        };

    @observable private loading = false;
    @observable private resultData: any = {};

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getList();
    }

    getList() {
        this.query.setReq({
            url: '/api/crm/payment/paytypes',
            method: 'get',
        });

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data.paytype') as any) || [];
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    render() {

        return (
            <Spin spinning={this.loading}>
                <div style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    padding: 24,
                }}>
                    {this.kind[this.props.match.params.kind].title}
                </div>
                <br />
                <BaseForm form={this.props.form} item={this.kind[this.props.match.params.kind].item()} onSubmit={this.handleSubmit} />
            </Spin>
        );
    }

    private handleSubmit = (ev: any) => {
        ev.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.loading = true;
                const json: any = _.assign({}, values, {
                    chargeCid: this.props.match.params.id,
                });

                mutate<{}, any>({
                    url: this.kind[this.props.match.params.kind].url,
                    method: 'post',
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
