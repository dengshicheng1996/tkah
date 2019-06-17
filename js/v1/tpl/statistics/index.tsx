import { LocaleProvider, zhCNC } from 'common/antd/localeProvider';
import { AuthProvider } from 'common/component/auth';
import * as moment from 'moment';
import * as React from 'react';
import { render } from 'react-dom';
import { AppStateProvider } from './common/appStateStore';
import { routes } from './routes';

moment.locale('zh-cn');

render(
    <LocaleProvider locale={zhCNC}>
        <AuthProvider loginURL='/statistics/user/login'
            config={{
                statusURL: '/api/wap/logged',
                loginURL: '/api//wap/dc',
            }}>
            <AppStateProvider>
                {routes}
            </AppStateProvider>
        </AuthProvider>
    </LocaleProvider>,
    document.getElementById('reactApp'));
