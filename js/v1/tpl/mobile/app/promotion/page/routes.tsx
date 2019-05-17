
import * as React from 'react';
import {
    Redirect,
    Route,
} from 'react-router-dom';
import { routes as applyRoute } from './apply/routes';
import { LayoutBase } from './layoutBase';

export const routes = (
    <LayoutBase>
        <Route component={() => applyRoute} />
    </LayoutBase>

);
