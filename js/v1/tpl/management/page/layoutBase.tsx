import { loginRequired, withAuth, WithAuth } from 'common/auth';
import { SearchToObject } from 'common/fun';
import * as $ from 'jquery';
import 'jquery.cookie';
import * as _ from 'lodash';
import { WithAppState, withAppState } from 'management/common/appStateStore';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

declare const window: any;

@loginRequired
@observer
export class LayoutBaseView extends React.Component<RouteComponentProps<any> & WithAppState & WithAuth> {
    private search: any = SearchToObject(this.props.location.search);
    private disposers: Array<() => void> = [];

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.setData();
    }

    componentDidUpdate() {
        this.setData();
    }

    setData() {
        if (this.props.auth.status.state === 'user') {
            this.props.data.appState.currentUser = Object.assign({}, this.props.data.appState.currentUser, {
                token: $.cookie('token'),
            });
        }
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }

}

export const LayoutBase = withRouter(withAuth(withAppState(LayoutBaseView)));
