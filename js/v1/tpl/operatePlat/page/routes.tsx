
import * as React from 'react';
import {
    Redirect,
    Route,
} from 'react-router-dom';
import { Edit } from './plat/account/edit';
import { List } from './plat/account/list';

export const routes = (
    <div>
        <Route
            exact
            path='/'
            render={() => <Redirect to='/operatePlat/account' />}
        />
        <Route
            exact
            path='/operatePlat'
            render={() => <Redirect to='/operatePlat/account' />}
        />
        <Route exact path='/operatePlat/account' component={List} />
        <Route exact path={['/operatePlat/account/edit', '/operatePlat/account/edit/:id']} component={Edit} />
        <Route exact path='/operatePlat/company' component={List} />
    </div>

);
