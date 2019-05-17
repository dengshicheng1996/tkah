import * as React from 'react';
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { UserRouter } from './page/user/routes';

export const routes = (
    <Router>
        <Switch>
            <Route
                exact
                path='/'
                render={() => <Redirect to='/promotion/user/login' />}
            />
            <Route
                exact
                path='/promotion'
                render={() => <Redirect to='/promotion/user/logins' />}
            />
            <Route path='/promotion/user' render={() => UserRouter} />
        </Switch>
    </Router>
);
