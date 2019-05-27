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
                <NoticeBar mode='link' action={<span>去看看</span>}>
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
                        <div>
                            Content of first tab
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
