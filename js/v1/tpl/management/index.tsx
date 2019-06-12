import { LocaleProvider, zhCNC } from 'common/antd/localeProvider';
import { AuthProvider } from 'common/component/auth';
import { SearchToObject } from 'common/fun';
import * as $ from 'jquery';
import * as moment from 'moment';
import * as React from 'react';
import { render } from 'react-dom';
import './common/antd_theme.less';
import { AppStateProvider } from './common/appStateStore';
import { routes } from './routes';

console.log(moment);
console.log(moment.locale);
// moment.locale('zh-cn');

declare const window: any;

if (SearchToObject(window.location.search)['zdgj_token']) {
    $.cookie('token', SearchToObject(window.location.search)['zdgj_token'], { path: '/' });
}

render(
    <LocaleProvider locale={zhCNC}>
        <AuthProvider loginURL='/management/user/login'
            config={{
                statusURL: '/api/logged',
                loginURL: '/api/login',
                logoutURL: '/api/logout',
                sendCodeURL: '/api/sendCode',
            }}>
            <AppStateProvider>
                {routes}
            </AppStateProvider>
        </AuthProvider>
    </LocaleProvider>,
    document.getElementById('reactApp'));
