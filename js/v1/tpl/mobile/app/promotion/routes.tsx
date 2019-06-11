import * as React from 'react';
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { HttpStatus404 } from '../httpStatus/page/404';
import { UserRouter } from './page/user/routes';

export const routes = (
    <Router>
        <Switch>
            <Route
                exact
                path='/promotion'
                render={() => <Redirect to='/promotion/user/login' />}
            />
            <Route path='/promotion/user' render={() => UserRouter} />
            <Route component={HttpStatus404} />
        </Switch>
    </Router>
);
