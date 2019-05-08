
import * as React from 'react';
import {
    Redirect,
    Route,
} from 'react-router-dom';
import { routes as billRoute } from './bill/routes';
import { LayoutBase } from './layoutBase';

export const routes = (
    <LayoutBase>
        <Route component={() => billRoute} />
    </LayoutBase>

);
