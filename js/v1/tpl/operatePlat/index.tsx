import zhCN from 'antd/lib/locale-provider/zh_CN';
import { LocaleProvider } from 'common/antd/localeProvider';
import { AuthProvider } from 'common/auth';
import { AppStateProvider } from 'flowSquare/common/appStateStore';
import * as React from 'react';
import { render } from 'react-dom';
import { routes } from './routes';

render(
    <AuthProvider>
        <LocaleProvider locale={zhCN}>
            <AppStateProvider>
                {routes}
            </AppStateProvider>
        </LocaleProvider>
    </AuthProvider>,
    document.getElementById('app'));
