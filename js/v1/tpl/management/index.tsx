import { LocaleProvider, zhCNC } from 'common/antd/localeProvider';
import { AuthProvider } from 'common/component/auth';
import { SearchToObject } from 'common/fun';
import * as $ from 'jquery';
import moment from 'moment';
import * as React from 'react';
import { render } from 'react-dom';
import './common/antd_theme.less';
import { AppStateProvider } from './common/appStateStore';
import { routes } from './routes';

moment.locale('zh-cn');

declare const window: any;

if (SearchToObject(window.location.search)['token']) {
    $.cookie('token', SearchToObject(window.location.search)['token'], { path: '/' });
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
