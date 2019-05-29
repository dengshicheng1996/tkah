import { Card } from 'common/antd/mobile/card';
import { Flex } from 'common/antd/mobile/flex';
import { NoticeBar } from 'common/antd/mobile/notice-bar';
import { Tabs } from 'common/antd/mobile/tabs';
import { AppFn, IsAppPlatform, NavBarBack, NavBarTitle } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { Querier } from 'common/component/restFull';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import moment = require('moment');
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Sticky, StickyContainer } from 'react-sticky';
import { ModalBank } from './modal/bank';
import { ModalInfo } from './modal/info';

@Radium
@observer
class HomeView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private query: Querier<any, any> = new Querier(null);
    private lastBillQuery: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private currentBillLoading: boolean = false;
    @observable private lastBillLoading: boolean = false;
    @observable private currentBillData: any = [];
    @observable private lastBillData: any = [];

    constructor(props: any) {
        super(props);
        NavBarBack(() => {
            if (IsAppPlatform()) {
                AppFn.actionFinish();
            } else {
                window.history.back();
            }
        });
        NavBarTitle('账单', () => {
            this.props.data.pageTitle = '账单';
        });
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getCurrentBill();
        this.getLastBill();
    }

    getCurrentBill() {
        this.query.setReq({
            url: '/api/mobile/order/current',
            method: 'get',
        });

        this.disposers.push(reaction(() => {
            return this.props.data.stepInfo.repeat;
        }, searchData => {
            this.query.setReq({
                url: '/api/mobile/authdata/module',
                method: 'get',
                repeat: true,
            });
        }));

        this.disposers.push(autorun(() => {
            this.currentBillLoading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.currentBillData = searchData;
        }));
    }

    getLastBill() {
        this.lastBillQuery.setReq({
            url: '/api/mobile/order/last',
            method: 'get',
        });

        this.disposers.push(reaction(() => {
            return this.props.data.stepInfo.repeat;
        }, searchData => {
            this.lastBillQuery.setReq({
                url: '/api/mobile/authdata/module',
                method: 'get',
                repeat: true,
            });
        }));

        this.disposers.push(autorun(() => {
            this.lastBillLoading = this.lastBillQuery.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.lastBillQuery.result, 'result.data') as any) || [];
        }, searchData => {
            this.lastBillData = searchData;
        }));
    }

    render() {
        return (
            <div>
                <RadiumStyle scopeSelector={['.bill']}
                    rules={{
                        '.am-tabs-tab-bar-wrap': {
                            borderRadius: '50px',
                            overflow: 'hidden',
                            boxShadow: '0px 2px 10px 0px rgba(171,171,171,0.2)',
                        },
                        '.am-tabs-default-bar-underline': {
                            marginLeft: '10%',
                            width: '30% !important',
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
                <StickyContainer style={{ padding: '20px' }}>
                    <Tabs tabs={[
                        { title: '当前待还' },
                        { title: '剩余待还' },
                    ]}
                        initialPage={0}
                        renderTabBar={(props: any) => (
                            <Sticky>
                                {(p) => <div style={{ ...p.style, zIndex: 1 }}><Tabs.DefaultTabBar {...props} /></div>}
                            </Sticky>
                        )}>
                        <div>
                            {
                                this.currentBillData.map((r: any, i: number) => {
                                    const order = [];
                                    if (r.bill) {
                                        order.push(
                                            <CurrentBill key='bill' type='bill' info={r.bill} />,
                                        );
                                    }
                                    if (r.service_fee) {
                                        order.push(
                                            <CurrentBill key='service_fee' type='service_fee' info={r.service_fee} />,
                                        );
                                    }
                                    return (
                                        <div key={i}>{order}</div>
                                    );
                                })
                            }
                        </div>
                        <div>
                            {
                                this.lastBillData.map((r: any, i: number) => {
                                    return (
                                        <LastBill key={i} info={r} />
                                    );
                                })
                            }
                        </div>
                    </Tabs>
                </StickyContainer>
                {/* <ModalBank /> */}
            </div>
        );
    }
}

@Radium
@observer
class CurrentBill extends React.Component<{ info: any, type: string }, {}> {
    private description: { [key: number]: JSX.Element } = {
        1: (<span>您的账单<span style={{ color: '#E55800' }}>已逾期</span>，请尽快还款，否则将<span style={{ color: '#E55800' }}>产生罚息</span>同时将影响您的<span style={{ color: '#E55800' }}>个人征信</span>。</span>),
        2: (<span>我没在<span style={{ color: '#E55800' }}>还款日当日</span>开始自动扣款，请确保储蓄卡资金充足，或主动还款。</span>),
    };
    private serviceFee = (<span>我没在<span style={{ color: '#E55800' }}>放款日当天</span>开始自动扣款，请确保储蓄卡资金充足，或主动还款。</span>);

    @observable private detailModal: boolean = false;

    render() {
        const { info, type } = this.props;
        return (
            <div style={{ paddingTop: '20px' }}>
                <div style={{
                    background: 'rgba(255,255,255,1)',
                    boxShadow: '0px 1px 5px 0px rgba(171,171,171,0.2)',
                    borderRadius: '10px',
                    padding: '20px',
                }}>
                    <div style={{ color: 'rgba(153,153,153,1)', textAlign: 'center', fontSize: '14px' }}>
                        {type === 'bill' ? `${moment(info.should_repayment_date_text).format('YYYY年MM月DD日')}应还（元）` : '手续费'}
                    </div>
                    <div style={{ color: '#E55800', textAlign: 'center', fontSize: '50px', marginTop: '15px' }}>
                        {type === 'bill' ? info.period_amount : info.service_chargea_amount}
                        <span style={{
                            padding: '5px',
                            fontSize: '12px',
                            background: 'rgba(255,103,74,1)',
                            color: '#fff',
                            verticalAlign: 'text-top',
                            borderRadius: '12px 12px 12px 0px',
                        }} onClick={() => { this.switchDetail(); }}>详情</span>
                    </div>
                    <div style={{ color: 'rgba(153,153,153,1)', textAlign: 'center', fontSize: '14px', marginTop: '22px' }}>
                        {type === 'bill' ? this.description[info.overdue_status] : this.serviceFee}
                    </div>
                    <Flex style={{ marginTop: '30px' }}>
                        {
                            info.allow_extend === 1 ? (
                                <Flex.Item>
                                    <div style={{
                                        background: 'linear-gradient(131deg,rgba(72,131,250,1) 0%,rgba(98,54,255,1) 100%)',
                                        boxShadow: '0px 1px 5px 0px rgba(171,171,171,0.6)',
                                        borderRadius: '22px',
                                        fontSize: '15px',
                                        fontWeight: 500,
                                        color: '#fff',
                                        lineHeight: '21px',
                                        textAlign: 'center',
                                        padding: '12px 0',
                                        margin: '0 10px',
                                    }}>申请展期</div>
                                </Flex.Item>
                            ) : null
                        }
                        <Flex.Item>
                            <div style={{
                                background: 'linear-gradient(119deg,rgba(252,155,4,1) 0%,rgba(247,80,15,1) 100%)',
                                boxShadow: '0px 1px 5px 0px rgba(171,171,171,0.6)',
                                borderRadius: '22px',
                                fontSize: '15px',
                                fontWeight: 500,
                                color: '#fff',
                                lineHeight: '21px',
                                textAlign: 'center',
                                padding: '12px 0',
                                margin: '0 10px',
                            }}>主动还款</div>
                        </Flex.Item>
                    </Flex>
                </div>
                <ModalInfo title={type === 'bill' ? `${moment(info.should_repayment_date_text).format('YYYY年MM月DD日')}应还账单` : '手续费'}
                    modal={this.detailModal}
                    onChangeModal={this.switchDetail}>
                    {
                        type === 'bill' ?
                            (
                                <Info info={info} />
                            ) :
                            (
                                <div>
                                    {
                                        (info.items || []).map((r: any, i: number) => {
                                            return (
                                                <Flex key={i}>
                                                    <Flex.Item style={{ color: '#999999', fontSize: '14px' }}>{r.label}</Flex.Item>
                                                    <Flex.Item style={{ color: '#4C4C4C', fontSize: '14px', textAlign: 'right' }}>{r.value}</Flex.Item>
                                                </Flex>
                                            );
                                        })
                                    }
                                </div>
                            )
                    }
                </ModalInfo>
            </div>
        );
    }

    private switchDetail = () => {
        this.detailModal = !this.detailModal;
    }
}

@Radium
@observer
class LastBill extends React.Component<{ info: any }, {}> {
    @observable private detailModal: boolean = false;
    @observable private detail: any;

    render() {
        const { info } = this.props;
        return (
            <div style={{ paddingTop: '20px' }}>
                <Card>
                    <Card.Header
                        title={(
                            <div>
                                <span style={{ fontSize: '14px', color: '#999', marginRight: '40px' }}>{moment(info.should_repayment_date_text).format('YYYY-MM-DD')}</span>
                                <span style={{ fontSize: '16px', color: '#333' }}>账单生成日</span>
                            </div>
                        )}
                    />
                    <Card.Body>
                        {
                            info.bills.map((r: any, i: number) => {
                                return (
                                    <Flex key={i} style={{ lineHeight: '35px', margin: '3px 0' }}>
                                        <Flex.Item style={{ flex: 1.5, color: '#4C4C4C', fontSize: '14px' }}>{moment(r.should_repayment_date_text).format('YYYY-MM-DD')}</Flex.Item>
                                        <Flex.Item style={{ flex: 1, color: '#FF4C4C', fontSize: '14px', textAlign: 'right' }}>{r.period_amount}</Flex.Item>
                                        <Flex.Item style={{ flex: 1, color: '#FF4C4C', fontSize: '14px', textAlign: 'right' }}>{r.overdue_status_text}</Flex.Item>
                                        <Flex.Item style={{ flex: 1, color: '#E55800', fontSize: '14px', textAlign: 'right' }}>
                                            <span style={{
                                                width: '48px',
                                                height: '23px',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(229,88,0,1)',
                                                padding: '3px 8px',
                                            }} onClick={() => { this.switchDetail(r); }}>详情</span>
                                        </Flex.Item>
                                    </Flex>
                                );
                            })
                        }
                    </Card.Body>
                </Card>
                <ModalInfo title={moment(info.should_repayment_date_text).format('YYYY年MM月DD日')}
                    modal={this.detailModal}
                    onChangeModal={this.switchDetail}>
                    <Info info={this.detail} />
                </ModalInfo>
            </div>
        );
    }

    private switchDetail = (info: any) => {
        if (info) {
            this.detail = info;
        }
        this.detailModal = !this.detailModal;
    }
}

@Radium
class Info extends React.Component<{ info: any }, {}> {
    render() {
        const { info } = this.props;
        return (
            <div>
                <Flex style={{ lineHeight: '35px', margin: '3px 0' }}>
                    <Flex.Item style={{ color: '#999999', fontSize: '14px' }}>本期还款金额</Flex.Item>
                    <Flex.Item style={{ color: '#4C4C4C', fontSize: '14px', textAlign: 'right' }}>{info.period_amount}元</Flex.Item>
                </Flex>
                <Flex style={{ lineHeight: '35px', margin: '3px 0' }}>
                    <Flex.Item style={{ color: '#999999', fontSize: '14px' }}>本期已还款金额</Flex.Item>
                    <Flex.Item style={{ color: '#4C4C4C', fontSize: '14px', textAlign: 'right' }}>
                        {parseFloat(info.repaid_benjin) + parseFloat(info.repaid_lixi) + parseFloat(info.repaid_fee) + parseFloat(info.repaid_overdue)}元
                    </Flex.Item>
                </Flex>
                <Flex style={{ lineHeight: '35px', margin: '3px 0' }}>
                    <Flex.Item style={{ color: '#999999', fontSize: '14px' }}>本期应还手续费</Flex.Item>
                    <Flex.Item style={{ color: '#4C4C4C', fontSize: '14px', textAlign: 'right' }}>{info.service_charge}元</Flex.Item>
                </Flex>
                <Flex style={{ lineHeight: '35px', margin: '3px 0' }}>
                    <Flex.Item style={{ color: '#999999', fontSize: '14px' }}>本期应还本金</Flex.Item>
                    <Flex.Item style={{ color: '#4C4C4C', fontSize: '14px', textAlign: 'right' }}>{info.capital_price}元</Flex.Item>
                </Flex>
                <Flex style={{ lineHeight: '35px', margin: '3px 0' }}>
                    <Flex.Item style={{ color: '#999999', fontSize: '14px' }}>本期应还利息</Flex.Item>
                    <Flex.Item style={{ color: '#4C4C4C', fontSize: '14px', textAlign: 'right' }}>{info.lixi}元</Flex.Item>
                </Flex>
                <Flex style={{ lineHeight: '35px', margin: '3px 0' }}>
                    <Flex.Item style={{ color: '#999999', fontSize: '14px' }}>本期逾期</Flex.Item>
                    <Flex.Item style={{ color: '#4C4C4C', fontSize: '14px', textAlign: 'right' }}>{info.overdue_days}天</Flex.Item>
                </Flex>
                <Flex style={{ lineHeight: '35px', margin: '3px 0' }}>
                    <Flex.Item style={{ color: '#999999', fontSize: '14px' }}>本期罚息</Flex.Item>
                    <Flex.Item style={{ color: '#4C4C4C', fontSize: '14px', textAlign: 'right' }}>{info.overdue_price}元</Flex.Item>
                </Flex>
            </div>
        );
    }
}

export const Home = withRouter(withAppState(HomeView));
