import { message } from 'common/antd/message';
import { withAuth, WithAuth } from 'common/component/auth';
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
                this.props.history.push('/operatePlat/user/login');
                return;
            }
            message.warning(r.error);
        }).catch(() => {
            this.props.history.push('/operatePlat/user/login');
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
            <Route path='/operatePlat/user/logout' component={withRouter(withAuth(Logout))} />
        </Switch>
    </span>
);
