
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
            render={() => <Redirect to='/operatePlat/domain' />}
        />
        <Route exact path='/operatePlat/domain' component={List} />
    </div>

);
