import * as React from 'react';
import {
    Route,
    Switch,
} from 'react-router-dom';
import audit from './audit';
import withdraw from './withdraw';
const routes = (
    <div>
        <Switch>
            <Route path='/management/credit/audit' component={audit} />
            <Route path='/management/credit/withdraw' component={withdraw} />
        </Switch>
    </div>
);
export default routes;
