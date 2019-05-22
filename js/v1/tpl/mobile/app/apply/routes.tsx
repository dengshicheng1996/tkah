import * as React from 'react';
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { routes as pageRoutes } from './page/routes';

export const routes = (
    <Router>
        <Switch>
            <Route
                exact
                path='/'
                render={() => <Redirect to='/apply' />}
            />
            <Route
                exact
                path='/apply'
                render={() => <Redirect to='/apply' />}
            />
            <Route path='/apply' component={() => pageRoutes} />
        </Switch>
    </Router>
);
