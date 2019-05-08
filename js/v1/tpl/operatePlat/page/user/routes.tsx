import { getPromise } from 'common/ajax';
import * as React from 'react';
import {
    withRouter,
    Route,
    RouteComponentProps,
    Switch,
} from 'react-router-dom';
import { Login } from './login';

class Logout extends React.Component<RouteComponentProps<any>, {}> {
    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        getPromise('/auth/logout').then(() => {
            window.location.assign('/saas/user/login');
        }).catch(() => {
            window.location.assign('/saas/user/login');
        });
    }
    render() {
        return <div>退出中...</div>;
    }
}

export const UserRouter = (
    <span>
        <Switch>
            <Route path='/saas/user/login' component={Login} />
            <Route path='/saas/user/logout' component={withRouter(Logout)} />
        </Switch>
    </span>
);
