
import * as React from 'react';
import {
    Redirect,
    Route,
    Switch,
} from 'react-router-dom';
import { Base } from './base';
import { Home } from './home';
import { Module } from './modules';
import { Bioassay } from './modules/bioassay';
import { Ocr } from './modules/ocr';

export const routes = (
    <Base>
        <Route
            exact
            path='/apply'
            render={() => <Redirect to='/apply/home' />}
        />
        <Switch>
            <Route exact path='/apply/home' component={Home} />
            <Route exact path='/apply/module/ocr' component={Ocr} />
            <Route exact path='/apply/module/bioassay' component={Bioassay} />
            <Route exact path='/apply/module/:kind/:id' component={Module} />
        </Switch>
    </Base>

);
