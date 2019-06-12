import * as React from 'react';
import {
    BrowserRouter as Router,
    Route,
} from 'react-router-dom';
import { HttpStatus500 } from './page/500';

export const routes = (
    <Router>
        <Route component={HttpStatus500} />
    </Router>
);
