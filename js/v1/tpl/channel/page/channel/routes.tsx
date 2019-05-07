
import * as React from 'react';
import {
    Route,
    Switch,
} from 'react-router-dom';
import { Base } from './base';
import { Home } from './home';

export const routes = (
    <Base>
        <Switch>
            <Route exact path='/saas/channel/home' component={Home} />
        </Switch>
    </Base>

);
