
import { HttpStatus404 } from 'mobile/app/httpStatus404/page/404';
import * as React from 'react';
import {
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { Base } from './base';
import { BoundBank } from './boundBank';
import { Home } from './home';
import { Repayment } from './repayment';
import { RollOvers } from './rollOvers';
import { Status } from './status';

export const routes = (
    <Base>
        <Route
            exact
            path='/bill'
            render={() => <Redirect to='/bill/home' />}
        />
        <Switch>
            <Route exact path='/bill/home' component={Home} />
            <Route exact path='/bill/boundBank' component={BoundBank} />
            <Route exact path='/bill/repayment/:kind/:id/:money' component={Repayment} />
            <Route exact path='/bill/roll-overs/:id' component={RollOvers} />
            <Route exact path='/bill/status/:kind/:money' component={Status} />
            <Route component={HttpStatus404} />
        </Switch>
    </Base>

);
