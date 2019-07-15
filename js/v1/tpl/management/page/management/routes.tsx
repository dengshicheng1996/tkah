import * as React from 'react';
import {
    Route,
    Switch,
} from 'react-router-dom';
import afterLoaning from './afterLoaning';
import basic from './basic/routes';
import consumption from './consumption/routes';
import credit from './credit/routes';
import custorm from './custorm/routes';
import Home from './home';
import noPermission from './noPermission';
import statistics from './statistics/routes';

export const routes = (
        <Switch>
            <Route exact path='/management/home' component={Home} />
            <Route exact path='/management/noPermission' component={noPermission} />
            <Route path='/management/basic' render={() => basic} />
            <Route path='/management/custorm' render={() => custorm} />
            <Route path='/management/credit' render={() => credit} />
            <Route path='/management/consumption' render={() => consumption} />
            <Route path='/management/afterLoaning' component={afterLoaning} />
            <Route path='/management/statistics' render={() => statistics} />
        </Switch>
);
