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
            <Route path='/management/user' component={() => UserRouter} />
            <Route path='/management' component={LayoutBase} />
            <Route path='/' component={LayoutBase} />
        </Switch>
    </Router>
);
