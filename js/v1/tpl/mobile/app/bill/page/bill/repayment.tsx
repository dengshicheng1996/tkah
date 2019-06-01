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

@Radium
@observer
export class RepaymentView extends React.Component<RouteComponentProps<any> & WithAppState & { form: any }, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private payModal: boolean = false;
    @observable private loading: boolean = true;
    @observable private resultData: any = [];

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
            this.props.history.push(`/bill/home`);
        });
        NavBarTitle('还款', () => {
            this.props.data.pageTitle = '还款';
        });
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getBankList();
    }

    getBankList() {
        this.query.setReq({
            url: '/api/wap/bankbf',
            method: 'get',
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.resultData = searchData;
        }));
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
                    onChangeModal={this.switchDetail}
                    onSubmit={this.submit} />
            </div>
        );
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
        console.log(info);
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                let url = '/api/mobile/order/pay/fee';
                let json: any = {
                    bank_id: info.id,
                    service_charge_id: this.props.match.params.id,
                    money: this.props.match.params.money,
                };

                if (this.props.match.params.kind === 'bill') {
                    url = '/api/mobile/order/pay/bill';
                    json = {
                        bank_id: info.id,
                        fenqi_order_id: this.props.match.params.id,
                        money: this.props.match.params.money,
                    };
                }

                mutate<{}, any>({
                    url: '/api/wap/whereColumn',
                    method: 'post',
                    variables: json,
                }).then(r => {
                    if (r.status_code === 200) {
                        Toast.info('操作成功', 0.5, () => {
                            this.props.history.push(`/bill/home`);
                        });
                        return;
                    }
                    Toast.info(r.message);
                }, error => {
                    Toast.info(`Error: ${JSON.stringify(error)}`);
                });
            }
        });
    }
}

const FormCreate = createForm()(withRouter(withAppState(RepaymentView)));

export const Repayment = FormCreate;
