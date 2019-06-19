import * as React from 'react';
import {
    Route,
    RouteComponentProps,
    Switch,
    withRouter,
} from 'react-router-dom';
import { withAppState, WithAppState } from 'statistics/common/appStateStore';
import { Login } from './login';

class Logout extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
        this.props.data.appState.currentUser.channel_id = undefined;
        this.props.data.appState.currentUser.password = undefined;
        this.props.history.push('/statistics/user/login');
    }

    render() {
        return <div>退出中...</div>;
    }
}

export const UserRouter = (
    <span>
        <Switch>
            <Route path='/statistics/user/login' component={Login} />
            <Route path='/statistics/user/logout' component={withRouter(withAppState(Logout))} />
        </Switch>
    </span>
);
