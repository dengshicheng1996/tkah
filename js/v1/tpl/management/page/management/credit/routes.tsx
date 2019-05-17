import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import audit from './audit';
import withdraw from './withdraw';
const routes = (
    <div>
        <Switch>
            <Route exact path='/management/credit/audit' component={audit} />
            <Route exact path='/management/credit/withdraw' component={withdraw} />
        </Switch>
    </div>
);
export default routes;
