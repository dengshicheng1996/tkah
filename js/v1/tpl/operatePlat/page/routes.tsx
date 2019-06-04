
import * as React from 'react';
import {
    Redirect,
    Route,
} from 'react-router-dom';
import { Edit as AccountEdit } from './plat/account/edit';
import { List as AccountList } from './plat/account/list';

import { Edit as RoleEdit } from './plat/role/edit';
import { List as RoleList } from './plat/role/list';

import { Bank as CompanyBankEdit } from './plat/company/bank';
import { Edit as CompanyConfigEdit } from './plat/company/config';
import { Edit as CompanyEdit } from './plat/company/edit';
import { List as CompanyList } from './plat/company/list';
import { Edit as CompanyRecharge } from './plat/company/recharge';

export const routes = (
    <div>
        <Route
            exact
            path='/operatePlat'
            render={() => <Redirect to='/operatePlat/account' />}
        />
        <Route exact path='/operatePlat/account' component={AccountList} />
        <Route exact path={['/operatePlat/account/edit', '/operatePlat/account/edit/:id']} component={AccountEdit} />
        <Route exact path='/operatePlat/role' component={RoleList} />
        <Route exact path={['/operatePlat/role/edit', '/operatePlat/role/edit/:id']} component={RoleEdit} />
        <Route exact path='/operatePlat/company' component={CompanyList} />
        <Route exact path={['/operatePlat/company/edit', '/operatePlat/company/edit/:id']} component={CompanyEdit} />
        <Route exact path={'/operatePlat/company/config/edit/:id'} component={CompanyConfigEdit} />
        <Route exact path={'/operatePlat/company/bank/edit/:id'} component={CompanyBankEdit} />
        <Route exact path={'/operatePlat/company/recharge/:kind/:id'} component={CompanyRecharge} />
    </div>
);
