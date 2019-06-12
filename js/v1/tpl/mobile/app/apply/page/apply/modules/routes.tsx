
import { HttpStatus404 } from 'mobile/app/httpStatus404/page/404';
import * as React from 'react';
import {
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { Base } from './base';
import { Bioassay } from './bioassay';
import { Module } from './index';
import { Ocr } from './ocr';
import { Operator } from './operator';

export const routes = (
    <Base>
        <Switch>
            <Route exact path='/apply/module/:id/:kind' component={Module} />
            <Route exact path='/apply/module/:id/:kind/ocr' component={Ocr} />
            <Route exact path='/apply/module/:id/:kind/bioassay' component={Bioassay} />
            <Route exact path='/apply/module/:id/:kind/operator' component={Operator} />
            <Route component={HttpStatus404} />
        </Switch>
    </Base>
);
