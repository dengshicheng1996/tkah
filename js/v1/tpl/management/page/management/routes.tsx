
import * as React from 'react';
import {
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { Base } from './base';
import basic from './basic/routes';
import consumption from './consumption/routes';
import credit from './credit/routes';
import custorm from './custorm/routes';
import Home from './home';

export const routes = (
    <div>
        <Base>
            <Switch>
                <Route exact path='/management/home' component={Home} />
                <Route path='/management/basic' render={() => basic} />
                <Route path='/management/custorm' render={() => custorm} />
                <Route path='/management/credit' render={() => credit} />
                <Route path='/management/consumption' render={() => consumption} />
            </Switch>
        </Base>
    </div>
);
