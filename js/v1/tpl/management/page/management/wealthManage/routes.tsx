import * as React from 'react';
import {
    Route,
    Switch,
} from 'react-router-dom';
import extensionsRecord from './extensionsRecord';
import loansRecord from './loansRecord';
import paymentRecord from './paymentRecord';

const routes = (
    <div>
        <Switch>
            <Route path='/management/wealthManage/extensionsRecord' component={extensionsRecord} />
            <Route path='/management/wealthManage/paymentRecord' component={paymentRecord} />
            <Route path='/management/wealthManage/loansRecord' component={loansRecord} />
        </Switch>
    </div>
);
export default routes;
