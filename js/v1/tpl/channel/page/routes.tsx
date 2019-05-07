
import * as React from 'react';
import {
    Redirect,
    Route,
} from 'react-router-dom';
import { routes as channelRoute } from './channel/routes';
import { LayoutBase } from './layoutBase';

export const routes = (
    <LayoutBase>
        <Route component={() => channelRoute} />
    </LayoutBase>

);
