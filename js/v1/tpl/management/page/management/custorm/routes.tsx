import * as React from 'react';
import {
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import channelRecord from './channelRecord';
import custormList from './custormList/router';

const routes = (
    <div>
        <Switch>
            <Route path='/management/custorm/list' component={custormList} />
            <Route path='/management/custorm/channelRecord' component={channelRecord} />
        </Switch>
    </div>
);
export default routes;
