import { Icon } from 'common/antd/mobile/icon';
import { NavBar } from 'common/antd/mobile/nav-bar';
import { IsAppPlatform } from 'common/app';
import { loginRequired } from 'common/component/auth';
import 'jquery.cookie';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { style } from 'typestyle';

declare const window: any;

@loginRequired
@observer
export class LayoutBaseView extends React.Component<WithAppState, {}> {
    constructor(props: any) {
        super(props);
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
