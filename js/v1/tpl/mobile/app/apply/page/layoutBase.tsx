import { Icon } from 'common/antd/mobile/icon';
import { NavBar } from 'common/antd/mobile/nav-bar';
import { IsAppPlatform } from 'common/app';
import { loginRequired } from 'common/component/auth';
import { Querier } from 'common/component/restFull';
import 'jquery.cookie';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { style } from 'typestyle';

declare const window: any;

@loginRequired
@observer
export class LayoutBaseView extends React.Component<WithAppState, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private loading: boolean = false;

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getAuth();
    }

    getAuth() {
        this.query.setReq({
            url: '/api/mobile/authdata/module',
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
            this.props.data.stepInfo.stepNumber = 0;
            (searchData || []).forEach((r: { status: number; }, i: number) => {
                if (r.status === 2) {
                    this.props.data.stepInfo.stepNumber = i++;
                }
            });
            this.props.data.stepInfo.steps = searchData;
        }));
    }

    render() {
        return (
            <div>
                {
                    !IsAppPlatform() ?
                        (
                            <NavBar
                                mode='light'
                                icon={<Icon type='left' />}
                                onLeftClick={() => window.navbar.back()}
                                rightContent={[
                                    <Icon key='1' type='ellipsis' />,
                                ]}
                            >{this.props.data.pageTitle}</NavBar>
                        ) : null
                }
                <div className={style({
                    padding: '40px 20px',
                })}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export const LayoutBase = withAppState(LayoutBaseView);
