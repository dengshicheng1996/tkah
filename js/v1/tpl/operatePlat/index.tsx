import zhCN from 'antd/lib/locale-provider/zh_CN';
import { LocaleProvider } from 'common/antd/localeProvider';
import { AuthProvider } from 'common/auth';
import moment from 'moment';
import * as React from 'react';
import { render } from 'react-dom';
import { AppStateProvider } from './common/appStateStore';
import { routes } from './routes';

import 'moment/locale/zh-cn';
moment.locale('zh-cn');

render(
    <LocaleProvider locale={zhCN}>
        <AuthProvider loginURL='/operatePlat/user/login'
            config={{
                statusURL: '/api/crm/logged',
                loginURL: '/api/crm/login',
                logoutURL: '/api/crm/logout',
                sendCodeURL: '/api/crm/sendCode',
            }}>
            <AppStateProvider>
                {routes}
            </AppStateProvider>
        </AuthProvider>
    </LocaleProvider>,
    document.getElementById('reactApp'));
