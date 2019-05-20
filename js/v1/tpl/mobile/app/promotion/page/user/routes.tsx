import { getPromise } from 'common/ajax';
import { Toast } from 'common/antd/mobile/toast';
import { WithAuth, withAuth } from 'common/component/auth';
import { staticBaseURL } from 'common/staticURL';
import * as React from 'react';
import {
    Route,
    RouteComponentProps,
    Switch,
    withRouter,
} from 'react-router-dom';
import { LoginReg } from './loginReg';

class Logout extends React.Component<RouteComponentProps<any> & WithAuth, {}> {
    constructor(props: any) {
        super(props);
    }

    componentWillMount() {
        this.props.auth.logout().then((r) => {
            if (r.kind === 'result') {
                this.props.history.push('/promotion/user/login');
                return;
            }
            Toast.info(r.error);
        }).catch(() => {
            this.props.history.push('/promotion/user/login');
        });
    }
    render() {
        return <div>退出中...</div>;
    }
}

export const UserRouter = (
    <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundImage: `url(${staticBaseURL('login_bg.png')})`,
    }}>
        <Switch>
            <Route path='/promotion/user/logout' component={withRouter(withAuth(Logout))} />
            <Route path='/promotion/user/:kind' component={LoginReg} />
        </Switch>
    </div>
);
