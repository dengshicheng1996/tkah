import { Button } from 'common/antd/mobile/button';
import { Toast } from 'common/antd/mobile/toast';
import { AppFn, NavBarBack, NavBarTitle } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate, Querier } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/mobile/baseForm';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
import { staticBaseURL } from 'common/staticURL';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { createForm } from 'rc-form';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';
import { Frame } from './frame';
import { ModalInfo } from './modal/info';

@Radium
@observer
export class BoundBankView extends React.Component<RouteComponentProps<any> & WithAppState & { form: any }, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private detailModal: boolean = false;
    @observable private loading: boolean = true;
    @observable private bankListData: any = [];

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
            this.props.history.push(this.props.location.state.callBackUrl);
        });
        NavBarTitle('绑定银行卡', () => {
            this.props.data.pageTitle = '绑定银行卡';
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
            this.bankListData = searchData;
        }));
    }

    render() {
        const formItem: BaseFormItem[] = [
            {
                key: 'bank_num',
                component: (
                    <div style={{ margin: '0 15px 7px', fontSize: '15px' }}>
                        <span>银行卡</span>
                        <span style={{
                            fontSize: '12px',
                            borderRadius: '3px',
                            border: '1px solid rgba(229,88,0,1)',
                            color: 'rgba(229,88,0,1)',
                            padding: '1px 3px',
                            marginLeft: '5px',
                        }}>必填</span>
                    </div>
                ),
            },
            {
                key: 'bank_num',
                type: 'inputBankCard',
                typeComponentProps: { cols: 1, style: { textAlign: 'left' }, placeholder: '请输入银行卡' },
                required: true,
            },
            {
                key: 'phone',
                component: (
                    <div style={{ margin: '10px 15px 7px', fontSize: '15px' }}>
                        <span>预留手机号</span>
                        <span style={{
                            fontSize: '12px',
                            borderRadius: '3px',
                            border: '1px solid rgba(229,88,0,1)',
                            color: 'rgba(229,88,0,1)',
                            padding: '1px 3px',
                            marginLeft: '5px',
                        }}>必填</span>
                    </div>),
            },
            {
                key: 'phone',
                type: 'inputPhone',
                typeComponentProps: { cols: 1, style: { textAlign: 'left' }, placeholder: '请输入手机号' },
                fieldDecoratorOptions: {
                    rules: [
                        {
                            required: true,
                            message: '请输入手机号',
                        },
                        {
                            validator: (rule: any, value: any, callback: any) => {
                                if (!value) {
                                    callback('请输入手机号');
                                    return;
                                }
                                const reg = new RegExp(regular.phone_number.reg);
                                if (!reg.test(value.replace(/\s+/g, '')) && value) {
                                    callback('格式错误，请正确输入手机号');
                                    return;
                                }
                                callback();
                            },
                        },
                    ],
                },
                required: true,
            },
        ];
        return (
            <Frame title='绑定银行卡'
                bg={staticBaseURL('bg_card.png')}
                fullHeight={true}
                footer={(
                    <div style={{ padding: '10px 0' }}>
                        <Button type='primary'
                            onClick={this.handleSubmit}>确定绑卡</Button>
                    </div>
                )}>
                <RadiumStyle scopeSelector={['.bill', '.withdraw']}
                    rules={{
                        '.baseform .am-list-body::before, .am-list-body::after,.am-list-body div .am-list-line::after': {
                            height: '0px !important',
                        },
                        '.baseform .am-list-line': {
                            border: '1px solid rgba(151,151,151,0.16) !important',
                            background: 'rgba(247,247,247,1)',
                            borderRadius: '5px',
                            padding: '12px 10px',
                        },
                    }} />
                <div className={style({
                    margin: '0 -20px',
                })}>
                    <div className='baseform'>
                        <BaseForm form={this.props.form}
                            item={formItem} />
                    </div>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'rgba(252,156,4,1)',
                        textAlign: 'center',
                        marginTop: '10px',
                        textDecoration: 'underline',
                    }} onClick={this.switchDetail}>查看可以绑定的银行</div>
                </div>
                <ModalInfo title='可绑定的银行卡'
                    style={{ textAlign: 'left' }}
                    modal={this.detailModal}
                    onChangeModal={this.switchDetail}>
                    {
                        this.bankListData.map((r: any, i: number) => {
                            return (
                                <span key={i}>{i !== 0 ? '、' : ''}{r.bank_name}</span>
                            );
                        })
                    }
                </ModalInfo>
            </Frame>
        );
    }

    private switchDetail = () => {
        this.detailModal = !this.detailModal;
    }

    private handleSubmit = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                mutate<{}, any>({
                    url: '/api/wap/bindbank',
                    method: 'post',
                    variables: values,
                }).then(r => {
                    if (r.status_code === 200) {
                        Toast.info('操作成功', 0.5, () => {
                            if (this.props.location.state.callBackUrl) {
                                this.props.history.push(this.props.location.state.callBackUrl);
                            }
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

const FormCreate = createForm()(withRouter(withAppState(BoundBankView)));

export const BoundBank = FormCreate;
