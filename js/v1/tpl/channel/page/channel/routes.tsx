
import * as React from 'react';
import {
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { Base } from './base';
import { Home } from './home';

export const routes = (
    <Base>
        <Route
            exact
            path='/'
            render={() => <Redirect to='/saas/channel/home' />}
        />
        <Switch>
            <Route exact path='/saas/channel/home' component={Home} />
        </Switch>
    </Base>

);
