
import { HttpStatus404 } from 'mobile/app/httpStatus/page/404';
import * as React from 'react';
import {
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { Home } from './home';
import { routes as ModulesRoutes } from './modules/routes';

export const routes = (
    <div>
        <Route
            exact
            path='/apply'
            render={() => <Redirect to='/apply/home' />}
        />
        <Switch>
            <Route exact path='/apply/home' component={Home} />
            <Route path='/apply/module/:id/:kind' render={() => ModulesRoutes} />
            <Route component={HttpStatus404} />
        </Switch>
    </div>

);
