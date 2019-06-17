
import * as React from 'react';
import {
    Redirect,
    Route,
} from 'react-router-dom';
import { List } from './statistics/dc/list';

export const routes = (
    <div>
        <Route
            exact
            path='/statistics'
            render={() => <Redirect to='/statistics/dc' />}
        />
        <Route exact path='/statistics/dc' component={List} />
    </div>
);
