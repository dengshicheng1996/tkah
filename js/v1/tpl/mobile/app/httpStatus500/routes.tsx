import * as React from 'react';
import {
    BrowserRouter as Router,
    Route,
} from 'react-router-dom';
import { HttpStatus502 } from './page/502';

export const routes = (
    <Router>
        <Route component={HttpStatus502} />
    </Router>
);
