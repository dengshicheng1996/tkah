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
            <div className={style({
                padding: '40px',
            })}>
                {this.props.children}
            </div>
        );
    }

}

export const LayoutBase = LayoutBaseView;
