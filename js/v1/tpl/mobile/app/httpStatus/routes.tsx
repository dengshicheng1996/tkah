import * as React from 'react';
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { HttpStatus404 } from './page/404';

export const routes = (
    <Router>
        <Switch>
            <Route
                exact
                path='/http-status'
                render={() => <Redirect to='/http-status/404' />}
            />
            <Route path='/http-status/404' component={HttpStatus404} />
        </Switch>
    </Router>
);
