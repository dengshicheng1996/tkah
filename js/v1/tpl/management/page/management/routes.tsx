
import * as React from 'react';
import {
    Route,
    Switch,
} from 'react-router-dom';
import basic from './basic/routes';
import Home from './home';

export const routes = (
    <div>
        <Switch>
            <Route exact path='/management/home' component={Home} />
            <Route path='/management/basic' render={() => basic} />
        </Switch>
    </div>
);
