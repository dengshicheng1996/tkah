import { setDefaultLoginURL } from 'common/auth';
import * as React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom';
import { LayoutBase } from './page/layoutBase';
import { UserRouter } from './page/user/routes';

setDefaultLoginURL('/operatePlat/user/login');

export const routes = (
    <Router>
        <Switch>
            <Route path='/operatePlat/user' render={() => UserRouter} />
            <Route path='/operatePlat' component={LayoutBase} />
        </Switch>
    </Router>
);
