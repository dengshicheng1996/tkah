import { Flex } from 'common/antd/mobile/flex';
import { AppFn, IsAppPlatform, NavBarBack, NavBarTitle } from 'common/app';
import { Querier } from 'common/component/restFull';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

@Radium
@observer
class HomeView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private resultData: any;
    @observable private loading: boolean;

    constructor(props: any) {
        super(props);
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
        this.getCurrentBill();
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
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    render() {
        return (
            <div>
                <div style={{ background: '#E55800', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px' }}>到账金额（元）</div>
                    <div style={{ fontSize: '40px' }}>20000.00</div>
                    <div>
                        <Flex>
                            <Flex.Item>
                                <div style={{ fontSize: '12px', color: '#FFB485' }}>授信金额（元）</div>
                                <div style={{ fontSize: '17px', color: '#fff' }}>2000.00</div>
                            </Flex.Item>
                            <Flex.Item>
                                <div style={{ fontSize: '12px', color: '#FFB485' }}>授信金额（元）</div>
                                <div style={{ fontSize: '17px', color: '#fff' }}>2000.00</div>
                            </Flex.Item>
                            <Flex.Item>
                                <div style={{ fontSize: '12px', color: '#FFB485' }}>授信金额（元）</div>
                                <div style={{ fontSize: '17px', color: '#fff' }}>2000.00</div>
                            </Flex.Item>
                        </Flex>
                    </div>
                </div>
            </div>
        );
    }
}

export const Home = withRouter(withAppState(HomeView));
