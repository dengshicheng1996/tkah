
import * as React from 'react';
import {
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import account from './account';
import channel from './channel';
import init from './init';
import { Role as RoleList } from './role';

const routes = (
    <div>
        <Route path='/management/basic/init' component={init} />
        <Route path='/management/basic/channel' component={channel} />
        <Route path='/management/basic/account' component={account} />
        <Route path='/management/basic/role' component={RoleList} />
    </div>
);
export default routes;
