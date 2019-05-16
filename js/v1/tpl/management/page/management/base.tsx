import { loginRequired } from 'common/component/auth';
import * as _ from 'lodash';
import * as React from 'react';

// @loginRequired
export class BaseView extends React.Component<{}, {}> {

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div>
                {
                    this.props.children
                }
            </div>
        );
    }

}

export const Base = BaseView;
