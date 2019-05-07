import { withAppState, WithAppState } from 'bill/common/appStateStore';
import { SearchToObject } from 'bill/common/publicData';
import { loginRequired, withAuth, WithAuth } from 'common/auth';
import * as _ from 'lodash';
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
        this.props.data.appState.currentUser.cid = this.search.cid ? parseInt(this.search.cid) : this.props.data.appState.currentUser.cid;
        this.props.data.appState.currentUser.channelId = this.search.channelId ? parseInt(this.search.channelId) : this.props.data.appState.currentUser.channelId;
        this.props.data.appState.currentUser.productId = this.search.productId ? parseInt(this.search.productId) : this.props.data.appState.currentUser.productId;
        this.setData();
    }

    componentDidUpdate() {
        this.setData();
    }

    setData() {
        if (this.props.auth.status.state === 'user') {
            const token = this.props.auth.status.user.token ?
                this.props.auth.status.user.token : window.app && window.app.token ? window.app.token : undefined;

            this.props.data.appState.currentUser = Object.assign({}, this.props.data.appState.currentUser, {
                id: this.props.auth.status.user.id,
                cuid: this.props.auth.status.user.id,
                username: this.props.auth.status.user.name,
                email: this.props.auth.status.user.email,
                permissions: this.props.auth.status.user.tags,
                token,
            });

            if (!window.app.token) {
                window.app.token = token;
            }
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
