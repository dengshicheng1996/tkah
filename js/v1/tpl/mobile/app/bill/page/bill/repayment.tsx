import { ActivityIndicator } from 'common/antd/mobile/activity-indicator';
import { Button } from 'common/antd/mobile/button';
import { NoticeBar } from 'common/antd/mobile/notice-bar';
import { Toast } from 'common/antd/mobile/toast';
import { AppFn, NavBarBack, NavBarTitle } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate, Querier } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/mobile/baseForm';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { createForm } from 'rc-form';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';
import { ModalBank } from './modal/bank';
import { ModalVerify } from './modal/verify';

@Radium
@observer
export class RepaymentView extends React.Component<RouteComponentProps<any> & WithAppState & { form: any }, {}> {
    @observable private payModal: boolean = false;
    @observable private verifyModal: boolean = false;
    @observable private loading: boolean = true;
    @observable private data: any;
    @observable private animating: boolean = false;

    constructor(props: any) {
        super(props);
        AppFn.setConfig({
            backDic: {
                isHidden: 0,
                img: 1,
            },
            closeDic: {
                isHidden: 1,
                img: 2,
            },
            finishDic: {
                isHidden: 1,
                img: 3,
            },
        });
        NavBarBack(() => {
            console.log(1);
            this.props.history.push(`/bill/home`);
        });
        NavBarTitle('还款', () => {
            this.props.data.pageTitle = '还款';
        });
    }

    render() {
        const formItem: BaseFormItem[] = [
            {
                key: 'money',
                type: 'inputMoney',
                name: '支付金额',
                itemProps: { label: (<span style={{ fontSize: '45px' }}>￥</span>) },
                typeComponentProps: {
                    cols: 1,
                    style: { textAlign: 'left', fontSize: '30px' },
                    moneyKeyboardAlign: 'left',
                    placeholder: '请输入支付金额',
                },
                initialValue: this.props.match.params.money,
                required: true,
            },
        ];
        return (
            <div style={{ padding: '15px' }}>
                <RadiumStyle scopeSelector={['.bill']}
                    rules={{
                        '.repaymentBaseForm .am-list-body::before, .am-list-body::after,.am-list-body div .am-list-line::after': {
                            height: '0px !important',
                        },
                        '.repaymentBaseForm .am-list-line': {
                            borderBottom: '1px solid rgba(151,151,151,0.16) !important',
                            background: 'transparent',
                        },
                        '.repaymentBaseForm .am-list-body, .repaymentBaseForm  .am-list-item.am-input-item.am-list-item-middle': {
                            background: 'transparent',
                        },
                        '.repaymentBaseForm .am-list-item .am-input-label.am-input-label-5': {
                            width: '40px',
                        },
                        '.repaymentBaseForm .fake-input': {
                            fontSize: '30px !important',
                        },
                    }} />
                <NoticeBar mode='link' action={<a href='tel:01058850796' style={{
                    width: '61px',
                    height: '26px',
                    background: 'rgba(253,175,128,1)',
                    borderRadius: '13px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,1)',
                    textAlign: 'center',
                    lineHeight: '25px',
                }}>投诉</a>}>
                    遇到暴力催收，高额利息？
                    </NoticeBar>
                <div style={{ margin: '20px', textAlign: 'center', fontSize: '15px' }}>待还手续费</div>
                <div style={{ margin: '20px 0', textAlign: 'center', fontSize: '40px' }}>
                    <div className='repaymentBaseForm' style={{ margin: '30px 0 35px' }}>
                        <BaseForm form={this.props.form}
                            item={formItem} />
                    </div>
                </div>
                <Button type='primary'
                    onClick={this.handleSubmit}>支付</Button>
                <ModalBank modal={this.payModal}
                    money={this.props.form.getFieldValue('money')}
                    onChangeModal={this.switchDetail}
                    onSubmit={this.submit} />
                <ModalVerify modal={this.verifyModal}
                    phone={this.data && this.data.phone}
                    onChangeModal={this.switchVerify}
                    onSubmit={this.submit} />
                <ActivityIndicator
                    toast
                    text='Loading...'
                    animating={this.animating}
                />
            </div>
        );
    }

    private switchVerify = () => {
        this.verifyModal = !this.verifyModal;
    }

    private switchDetail = () => {
        this.payModal = !this.payModal;
    }

    private handleSubmit = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.switchDetail();
            }
        });
    }

    private submit = (info: any) => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.animating = true;
                let url = '/api/mobile/order/pay/fee';
                let json = {};
                if (this.data) {
                    json = _.assign({}, this.data, {
                        verify_code: info.verifyCode,
                    });
                } else {
                    json = {
                        bank_id: info.id,
                        service_charge_id: this.props.match.params.id,
                        money: values.money,
                    };
                    if (this.props.match.params.kind === 'bill') {
                        json = {
                            bank_id: info.id,
                            fenqi_order_id: this.props.match.params.id,
                            money: values.money,
                        };
                    }
                }

                if (this.props.match.params.kind === 'bill') {
                    url = '/api/mobile/order/pay/bill';
                }

                mutate<{}, any>({
                    url,
                    method: 'post',
                    variables: json,
                }).then(r => {
                    this.animating = false;
                    if (r.status_code === 200) {
                        if (r.data.verify_code === 1) {
                            Toast.info('验证码已发送');
                            this.data = json;
                            this.switchVerify();
                            return;
                        }
                        this.props.history.push(`/bill/status/${this.props.match.params.kind}/${values.money}`);
                        return;
                    }
                    Toast.info(r.message);
                }, error => {
                    this.animating = false;
                    Toast.info(`Error: ${JSON.stringify(error)}`);
                });
            }
        });
    }
}

const FormCreate = createForm()(withRouter(withAppState(RepaymentView)));

export const Repayment = FormCreate;
