import * as React from 'react';
import {
    BrowserRouter as Router,
    Route,
} from 'react-router-dom';
import { HttpStatus404 } from './page/404';

export const routes = (
    <Router>
        <Route component={HttpStatus404} />
    </Router>
);
