import * as React from 'react';
import {
    Route,
    Switch,
} from 'react-router-dom';
import conversion from './conversion';
import overdue from './overdue';

const routes = (
    <div>
        <Switch>
            <Route path='/management/statistics/conversion' component={conversion} />
            <Route path='/management/statistics/overdue' component={overdue} />
        </Switch>
    </div>
);
export default routes;
