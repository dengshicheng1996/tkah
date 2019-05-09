
import * as React from 'react';
import {
    Redirect,
    Route,
} from 'react-router-dom';
import { List } from './plat/list';

export const routes = (
    <div>
        <Route
            exact
            path='/'
            render={() => <Redirect to='/operatePlat/company' />}
        />
        <Route
            exact
            path='/operatePlat'
            render={() => <Redirect to='/operatePlat/company' />}
        />
        <Route exact path='/operatePlat/company' component={List} />
    </div>

);
