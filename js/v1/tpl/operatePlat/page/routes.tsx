
import * as React from 'react';
import {
    Redirect,
    Route,
} from 'react-router-dom';
import { Edit as AccountEdit } from './plat/account/edit';
import { List as AccountList } from './plat/account/list';

import { Edit as CompanyEdit } from './plat/company/edit';
import { List as CompanyList } from './plat/company/list';

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
        <Route exact path='/operatePlat/account' component={AccountList} />
        <Route exact path={['/operatePlat/account/edit', '/operatePlat/account/edit/:id']} component={AccountEdit} />
        <Route exact path='/operatePlat/company' component={CompanyList} />
        <Route exact path={['/operatePlat/company/edit', '/operatePlat/company/edit/:id']} component={CompanyEdit} />
    </div>

);
