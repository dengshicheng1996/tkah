
import * as React from 'react';
import {
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { Base } from './base';
import basic from './basic/routes';
import Home from './home';

export const routes = (
    <div>
        <Base>
            <Switch>
                <Route exact path='/management/home' component={Home} />
                <Route path='/management/basic' render={() => basic} />
            </Switch>
        </Base>
    </div>
);
