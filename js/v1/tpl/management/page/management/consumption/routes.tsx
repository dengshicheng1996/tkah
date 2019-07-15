import * as React from 'react';
import {
    Route,
    Switch,
} from 'react-router-dom';
import billing from './billing';
import note from './note';
import payOrder from './payOrder';

const routes = (
    <div>
        <Switch>
            <Route path='/management/consumption/billing' component={billing} />
            <Route path='/management/consumption/note' component={note} />
            <Route path='/management/consumption/payOrder' component={payOrder} />
        </Switch>
    </div>
);
export default routes;
