
import * as React from 'react';
import {
    Redirect,
    Route,
} from 'react-router-dom';
import { LayoutBase } from './layoutBase';
import { routes as managementRoute } from './management/routes';

export const routes = (
    <LayoutBase>
        <Route component={() => managementRoute} />
    </LayoutBase>

);
