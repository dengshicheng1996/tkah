
import { BoundBank } from 'mobile/app/bill/page/bill/boundBank';
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
            path='/withdraw'
            render={() => <Redirect to='/withdraw/home' />}
        />
        <Switch>
            <Route exact path='/withdraw/home' component={Home} />
            <Route exact path='/withdraw/boundBank' component={BoundBank} />
        </Switch>
    </Base>

);
