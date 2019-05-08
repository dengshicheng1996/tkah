import { getPromise } from 'common/ajax';
import * as React from 'react';
import {
    Route,
    RouteComponentProps,
    Switch,
    withRouter,
} from 'react-router-dom';
import { Login } from './login';

class Logout extends React.Component<RouteComponentProps<any>, {}> {
    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        getPromise('/auth/logout').then(() => {
            window.location.assign('/operatePlat/user/login');
        }).catch(() => {
            window.location.assign('/operatePlat/user/login');
        });
    }
    render() {
        return <div>退出中...</div>;
    }
}

export const UserRouter = (
    <span>
        <Switch>
            <Route path='/operatePlat/user/login' component={Login} />
            <Route path='/operatePlat/user/logout' component={withRouter(Logout)} />
        </Switch>
    </span>
);
