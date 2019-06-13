
import * as React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom';
import afterLoaning from './afterLoaning';
import basic from './basic/routes';
import consumption from './consumption/routes';
import credit from './credit/routes';
import custorm from './custorm/routes';
import Home from './home';

export const routes = (
        <Switch>
            <Route exact path='/management/home' component={Home} />
            <Route path='/management/basic' render={() => basic} />
            <Route path='/management/custorm' render={() => custorm} />
            <Route path='/management/credit' render={() => credit} />
            <Route path='/management/consumption' render={() => consumption} />
            <Route path='/management/afterLoaning' component={afterLoaning} />
        </Switch>
);
