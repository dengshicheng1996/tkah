
import * as React from 'react';
import {
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { Base } from './base';
import { Home } from './home';
import { Repayment } from './repayment';

export const routes = (
    <Base>
        <Route
            exact
            path='/bill'
            render={() => <Redirect to='/bill/home' />}
        />
        <Switch>
            <Route exact path='/bill/home' component={Home} />
            <Route exact path='/bill/repayment/:id' component={Repayment} />
        </Switch>
    </Base>

);
