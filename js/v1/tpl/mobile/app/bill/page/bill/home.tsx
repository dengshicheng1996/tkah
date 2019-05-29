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
import { style } from 'typestyle';
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
                        {
                            this.currentBillData.map((r, i) => {
                                const order = [];
                                if (r.bill) {
                                    order.push(
                                        <BillServiceFeeView key='bill' type='bill' info={r.bill} overdue_status={r.overdue_status} />,
                                    );
                                }
                                if (r.service_fee) {
                                    order.push(
                                        <BillServiceFeeView key='service_fee' type='service_fee' info={r.service_fee} />,
                                    );
                                }
                                return (
                                    <div key={i}>{order}</div>
                                );
                            })
                        }
                        <div>
                            Content of third tab
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
class BillServiceFeeView extends React.Component<{ info: any, type: string, overdue_status?: number }, {}> {
    private description = {
        1: (<span>我没在<span style={{ color: '#E55800' }}>还款日当日</span>开始自动扣款，请确保储蓄卡资金充足，或主动还款。</span>),
        2: (<span>您的账单<span style={{ color: '#E55800' }}>已逾期</span>，请尽快还款，否则将<span style={{ color: '#E55800' }}>产生罚息</span>同时将影响您的<span style={{ color: '#E55800' }}>个人征信</span>。</span>),
    };
    private serviceFee = (<span>我没在<span style={{ color: '#E55800' }}>放款日当天</span>开始自动扣款，请确保储蓄卡资金充足，或主动还款。</span>);

    @observable private detailModal: boolean = false;
    @observable private detail: any;

    render() {
        const { info, type, overdue_status } = this.props;
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
                        }} onClick={() => { this.showDetail(info); }}>详情</span>
                    </div>
                    <div style={{ color: 'rgba(153,153,153,1)', textAlign: 'center', fontSize: '14px', marginTop: '22px' }}>
                        {type === 'bill' ? this.description[overdue_status] : this.serviceFee}
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
                <ModalInfo title={type === 'bill' ? `${moment(info.should_repayment_date_text).format('YYYY年MM月DD日')}应还（元）` : '手续费'}
                    modal={this.detailModal}
                    onChangeModal={() => { this.detailModal = !this.detailModal; }}>
                </ModalInfo>
            </div>
        );
    }

    private showDetail(info: any) {
        console.log(11111);
        this.detail = info;
        this.detailModal = true;
    }
}

export const Home = withRouter(withAppState(HomeView));
