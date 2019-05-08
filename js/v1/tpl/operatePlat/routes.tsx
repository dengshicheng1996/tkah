import * as React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom';
import { LayoutBase } from './page/layoutBase';
import { UserRouter } from './page/user/routes';

export const routes = (
    <Router>
        <Switch>
            <Route path='/operatePlat/user' render={() => UserRouter} />
            <Route path='/operatePlat' component={LayoutBase} />
        </Switch>
    </Router>
);
