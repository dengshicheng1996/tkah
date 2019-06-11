import { ActivityIndicator } from 'common/antd/mobile/activity-indicator';
import { Button } from 'common/antd/mobile/button';
import { Flex } from 'common/antd/mobile/flex';
import { Icon } from 'common/antd/mobile/icon';
import { List } from 'common/antd/mobile/list';
import { Modal } from 'common/antd/mobile/modal';
import { Toast } from 'common/antd/mobile/toast';
import { AppFn, IsAppPlatform, NavBarBack, NavBarTitle } from 'common/app';
import { mutate, Querier } from 'common/component/restFull';
import { QuestionSvg } from 'common/component/svg';
import { Radium } from 'common/radium';
import { staticBaseURL } from 'common/staticURL';
import * as $ from 'jquery';
import 'jquery.cookie';
import * as _ from 'lodash';
import { ModalInfo } from 'mobile/app/bill/page/bill/modal/info';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

@Radium
@observer
class HomeView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private query: Querier<any, any> = new Querier(null);
    private bankListQuery: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private modalBankList: boolean = false;
    @observable private resultData: any;
    @observable private bankListData: any = [];
    @observable private loading: boolean = true;
    @observable private contract: boolean;
    @observable private selectBank: any;
    @observable private detailModal: boolean;

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
                isHidden: 0,
                img: 3,
            },
        });

        NavBarBack(() => {
            if (IsAppPlatform()) {
                AppFn.actionFinish();
            } else {
                window.history.back();
            }
        });
        NavBarTitle('提现', () => {
            this.props.data.pageTitle = '提现';
        });
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getData();
        this.getBankList();
    }

    getData() {
        this.query.setReq({
            url: '/api/wap/withdraw',
            method: 'get',
            variables: {
                apply_id: $.cookie('apply_id'),
            },
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || {};
        }, searchData => {
            if (searchData.withdraw_status === 2) {
                Modal.alert('提示', '提现已过有效期，请重新评估！', [
                    {
                        text: '确定', onPress: () => {
                            window.location.href = `/apply/home`;
                        },
                    },
                ]);
            }

            this.resultData = searchData;
        }));
    }

    getBankList() {
        this.bankListQuery.setReq({
            url: '/api/wap/bindbank',
            method: 'get',
        });

        this.disposers.push(reaction(() => {
            return (_.get(this.bankListQuery.result, 'result.data') as any) || [];
        }, searchData => {
            this.bankListData = searchData;
            if (searchData.length > 0) {
                this.selectBank = searchData[0];
            }
        }));
    }

    render() {
        if (this.loading) {
            return (
                <ActivityIndicator
                    toast
                    text='Loading...'
                />
            );
        }

        return (
            <div>
                <div style={{
                    backgroundColor: '#E55800',
                    backgroundImage: `url(${staticBaseURL('bg_sucai.png')})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'bottom',
                    textAlign: 'center',
                    padding: '20px 0 30px',
                }}>
                    <div style={{ fontSize: '14px', color: '#FFB485', margin: '0 0 10px' }}>提现金额（元）</div>
                    <div style={{ fontSize: '40px', color: '#fff' }}>{this.resultData.get_amount}</div>
                    <Flex style={{ margin: '15px 0 0' }}>
                        <Flex.Item style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#FFB485', lineHeight: '30px' }}>授信金额（元）</div>
                            <div style={{ fontSize: '17px', color: '#fff' }}>{this.resultData.credit_amount}</div>
                        </Flex.Item>
                        <Flex.Item style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#FFB485', lineHeight: '30px' }}>应还款金额（元）</div>
                            <div style={{ fontSize: '17px', color: '#fff' }}>
                                <span>{this.resultData.repayList.total_repay_amount}</span>
                                <QuestionSvg color='#FFB485'
                                    style={{
                                        verticalAlign: 'text-top',
                                        marginLeft: '5px',
                                        width: '17px',
                                        height: '17px',
                                    }}
                                    onClick={(ev: any) => {
                                        ev.preventDefault();
                                        ev.stopPropagation();
                                        this.switchDetail();
                                    }} />
                            </div>
                        </Flex.Item>
                        <Flex.Item style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#FFB485', lineHeight: '30px' }}>还款期数</div>
                            <div style={{ fontSize: '17px', color: '#fff' }}>{this.resultData.repayList.total_period}期</div>
                        </Flex.Item>
                    </Flex>
                </div>
                <List>
                    {
                        (this.resultData.service_charge || []).map((r: any, i: number) => {
                            return (
                                <List.Item key={i} extra={r.service_charge_yuan}>{r.name}</List.Item>
                            );
                        })
                    }
                </List>

                <List style={{ margin: '10px 0' }}>
                    {
                        this.selectBank ?
                            (
                                <List.Item
                                    arrow='horizontal'
                                    onClick={this.switchBankList}
                                >{this.selectBank.bank_name}</List.Item>
                            ) : (
                                <List.Item
                                    arrow='horizontal'
                                    onClick={() => {
                                        this.props.history.push({
                                            pathname: '/withdraw/boundBank',
                                            state: {
                                                callBackUrl: `/withdraw/home`,
                                            },
                                        });
                                    }}>
                                    <span style={{ color: '#E55800' }}>绑定新的银行卡</span>
                                </List.Item>
                            )
                    }
                </List>
                {/* <div style={{ textAlign: 'center' }}>
                    <Icon type={this.contract ? 'check-circle' : 'check-circle-o'}
                        size='xs'
                        style={{ marginRight: '5px' }}
                        color={this.contract ? '#6BBB12' : ''}
                        onClick={() => { this.contract = !this.contract; }} />
                    <span style={{ color: '#727272', verticalAlign: 'super' }}>我已阅读并确认</span>
                    <span style={{ color: '#F94B00', verticalAlign: 'super' }}>《借款合同1》</span>
                </div> */}
                <Button type='primary'
                    style={{ margin: '30px 30px 0' }}
                    onClick={this.handleSubmit}>提现</Button>

                <ModalInfo title='还款计划'
                    modal={this.detailModal}
                    onChangeModal={this.switchDetail}>
                    {
                        (this.resultData.fenqi || []).map((r: any, i: number) => {
                            return (
                                <Flex key={i}>
                                    <Flex.Item style={{ color: '#999999', fontSize: '14px' }}>第{r.period}期</Flex.Item>
                                    <Flex.Item style={{ color: '#4C4C4C', fontSize: '14px', textAlign: 'right' }}>{r.period_amount}</Flex.Item>
                                </Flex>
                            );
                        })
                    }
                </ModalInfo>

                <Modal
                    visible={this.modalBankList}
                    transparent
                    className='moda-bank'
                    title={(
                        <div>
                            <Icon type='cross'
                                color='#666666'
                                size='md'
                                className={style({
                                    position: 'absolute',
                                    left: '15px',
                                    top: '12px',
                                })}
                                onClick={this.switchBankList} />
                            <span>{'选择支付方式'}</span>
                        </div>
                    )}
                    maskClosable={false}
                >
                    <div className={style({
                        paddingTop: '15px',
                    })}>
                        <div className={this.bankListData && this.bankListData.length > 0 ? '' : 'pay'}>
                            <List>
                                {
                                    this.bankListData.map((r: any, i: number) => {
                                        return (
                                            <List.Item key={i}
                                                arrow='horizontal'
                                                onClick={() => { this.selectBank = r; }}
                                            >{r.bank_name}</List.Item>
                                        );
                                    })
                                }
                                <List.Item
                                    arrow='horizontal'
                                    onClick={() => {
                                        this.props.history.push({
                                            pathname: '/withdraw/boundBank',
                                            state: {
                                                callBackUrl: `/withdraw/home`,
                                            },
                                        });
                                    }}
                                >绑定新的银行卡</List.Item>
                            </List>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }

    private switchBankList = () => {
        this.modalBankList = !this.modalBankList;
    }

    private switchDetail = () => {
        this.detailModal = !this.detailModal;
    }

    private handleSubmit = () => {
        if (!this.selectBank) {
            Toast.info('请选择银行卡');
            return;
        }
        mutate<{}, any>({
            url: '/api/wap/withdraw',
            method: 'post',
            variables: {
                apply_id: $.cookie('apply_id'),
                customer_bank_id: this.selectBank.id,
            },
        }).then(r => {
            if (r.status_code === 200) {
                Toast.info('操作成功', 0.5, () => {
                    AppFn.actionFinish();
                });
                return;
            }
            Toast.info(r.message);
        }, error => {
            Toast.info(`Error: ${JSON.stringify(error)}`);
        });
    }
}

export const Home = withRouter(withAppState(HomeView));
