import { loginRequired } from 'common/component/auth';
import 'jquery.cookie';
import * as _ from 'lodash';
import * as React from 'react';

// @loginRequired
export class LayoutBaseView extends React.Component<{}, {}> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }

}

export const LayoutBase = LayoutBaseView;
