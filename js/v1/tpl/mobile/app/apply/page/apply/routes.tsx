
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
            path='/apply'
            render={() => <Redirect to='/apply/home' />}
        />
        <Switch>
            <Route exact path='/apply/home' component={Home} />
        </Switch>
    </Base>

);
