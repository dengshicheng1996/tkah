import zhCN from 'antd/lib/locale-provider/zh_CN';
import { LocaleProvider } from 'common/antd/localeProvider';
import { AuthProvider } from 'common/auth';
import * as React from 'react';
import { render } from 'react-dom';
import { AppStateProvider } from './common/appStateStore';
import { routes } from './routes';

render(
    <AuthProvider>
        <LocaleProvider locale={zhCN}>
            <AppStateProvider>
                {routes}
            </AppStateProvider>
        </LocaleProvider>
    </AuthProvider>,
    document.getElementById('reactApp'));
