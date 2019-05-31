
import * as React from 'react';
import {
    Route,
} from 'react-router-dom';
import { LayoutBase } from './layoutBase';
import { routes as withdrawRoute } from './withdraw/routes';

export const routes = (
    <LayoutBase>
        <Route component={() => withdrawRoute} />
    </LayoutBase>

);
