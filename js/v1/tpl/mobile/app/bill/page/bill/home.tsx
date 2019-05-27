import { Flex } from 'common/antd/mobile/flex';
import { NoticeBar } from 'common/antd/mobile/notice-bar';
import { Tabs } from 'common/antd/mobile/tabs';
import { AppFn, IsAppPlatform, NavBarBack, NavBarTitle } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { Querier } from 'common/component/restFull';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Sticky, StickyContainer } from 'react-sticky';

@Radium
@observer
class HomeView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private loading: boolean = false;
    @observable private resultData: any = [];
    @observable private stepNumber: number = -1;
    @observable private animating: boolean = false;

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
                }}>去看看</a>}>
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
                                {({ style }) => <div style={{ ...style, zIndex: 1 }}><Tabs.DefaultTabBar {...props} /></div>}
                            </Sticky>
                        )}>
                        <div style={{ paddingTop: '20px' }}>
                            <div style={{
                                background: 'rgba(255,255,255,1)',
                                boxShadow: '0px 1px 5px 0px rgba(171,171,171,0.2)',
                                borderRadius: '10px',
                                padding: '20px',
                            }}>
                                <div style={{ color: 'rgba(153,153,153,1)', textAlign: 'center', fontSize: '14px' }}>2019年05月7日应还（元）</div>
                                <div style={{ color: '#E55800', textAlign: 'center', fontSize: '50px', marginTop: '15px' }}>
                                    15000
                                    <span style={{
                                        padding: '5px',
                                        fontSize: '12px',
                                        background: 'rgba(255,103,74,1)',
                                        color: '#fff',
                                        verticalAlign: 'text-top',
                                        borderRadius: '12px 12px 12px 0px',
                                    }}>详情</span>
                                </div>
                                <div style={{ color: 'rgba(153,153,153,1)', textAlign: 'center', fontSize: '14px', marginTop: '22px' }}>
                                    我没在<span style={{ color: '#E55800' }}>还款日当日</span>开始自动扣款，请确保储蓄卡资金充足，或主动还款。
                                </div>
                                <Flex style={{ marginTop: '30px' }}>
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
                        </div>
                        <div>
                            Content of third tab
                        </div>
                    </Tabs>
                </StickyContainer>
            </div>
        );
    }
}

export const Home = withRouter(withAppState(HomeView));
