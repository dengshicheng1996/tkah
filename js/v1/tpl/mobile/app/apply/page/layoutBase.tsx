import { Icon } from 'common/antd/mobile/icon';
import { NavBar } from 'common/antd/mobile/nav-bar';
import { loginRequired } from 'common/component/auth';
import 'jquery.cookie';
import * as _ from 'lodash';
import * as React from 'react';
import { style } from 'typestyle';

@loginRequired
export class LayoutBaseView extends React.Component<{}, {}> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div>
                <NavBar
                    mode='light'
                    icon={<Icon type='left' />}
                    onLeftClick={() => console.log('onLeftClick')}
                    rightContent={[
                        <Icon key='0' type='search' style={{ marginRight: '16px' }} />,
                        <Icon key='1' type='ellipsis' />,
                    ]}
                >NavBar</NavBar>
                <div className={style({
                    padding: '40px',
                })}>
                    {this.props.children}
                </div>
            </div>
        );
    }

}

export const LayoutBase = LayoutBaseView;
