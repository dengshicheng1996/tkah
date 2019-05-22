import { AuthProvider } from 'common/component/auth';
import * as $ from 'jquery';
import * as React from 'react';
import { render } from 'react-dom';
import { routes } from './routes';

import { SearchToObject } from 'common/fun';
import 'mobile/common/antd_theme.less';
import { AppStateProvider } from 'mobile/common/appStateStore';

declare const window: any;

// tslint:disable-next-line:max-line-length
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9uZXdzLmxtcy5jb21cL2FwaVwvbW9iaWxlXC9sb2dpbiIsImlhdCI6MTU1ODQ1ODg0OSwiZXhwIjoxNTY2MjM0ODQ5LCJuYmYiOjE1NTg0NTg4NDksImp0aSI6IkVXNVlxekI2bXAwajhhbDEiLCJzdWIiOjE5LCJwcnYiOiI1OTYzZDYxMDEwOTI5M2U2Nzc4ZGYyYjZiMmVhNzI2Yjg1MTQxN2Q1In0.Qov8lCFcYmz8ycWyIc1HyMboPtnwGadsgcCf01y3daw';
$.cookie('token', token, { path: '/' });

if (SearchToObject(window.location.search)['token']) {
    $.cookie('token', SearchToObject(window.location.search)['token'], { path: '/' });
}

render(
    <AuthProvider loginURL='/promotion/user/login?next=/apply/home'
        refreshtoType='window'
        config={{
            statusURL: '/api/wap/logged',
            loginURL: '/api/wap/login',
            registerURL: '/api/wap/register',
            logoutURL: '/api/wap/logout',
            sendCodeURL: '/api/wap/sendverifycode',
        }}>
        <AppStateProvider>
            {routes}
        </AppStateProvider>
    </AuthProvider>,
    document.getElementById('reactApp'));
