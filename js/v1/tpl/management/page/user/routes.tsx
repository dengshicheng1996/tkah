import { getPromise } from 'common/ajax';
import { message } from 'common/antd/message';
import { WithAuth, withAuth } from 'common/component/auth';
import * as React from 'react';
import {
    Route,
    RouteComponentProps,
    Switch,
    withRouter,
} from 'react-router-dom';
import { Login } from './login';

class Logout extends React.Component<RouteComponentProps<any> & WithAuth, {}> {
    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        this.props.auth.logout().then((r) => {
            if (r.kind === 'result') {
                this.props.history.push('/management/user/login');
                return;
            }
            message.warning(r.error);
        }).catch(() => {
            this.props.history.push('/management/user/login');
        });
    }

    render() {
        return <div>退出中...</div>;
    }
}

export const UserRouter = (
    <span>
        <Switch>
            <Route path='/management/user/login' component={Login} />
            <Route path='/management/user/logout' component={withRouter(withAuth(Logout))} />
        </Switch>
    </span>
);
