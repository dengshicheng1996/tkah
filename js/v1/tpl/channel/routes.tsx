import * as React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom';
import { routes as pageRoutes } from './page/routes';

export const routes = (
    <Router>
        <Switch>
            <Route path='/saas/channel' component={() => pageRoutes} />
        </Switch>
    </Router>
);
