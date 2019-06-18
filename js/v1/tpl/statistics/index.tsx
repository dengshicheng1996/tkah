import { LocaleProvider, zhCNC } from 'common/antd/localeProvider';
import * as moment from 'moment';
import * as React from 'react';
import { render } from 'react-dom';
import { AppStateProvider } from './common/appStateStore';
import { routes } from './routes';

moment.locale('zh-cn');

render(
    <LocaleProvider locale={zhCNC}>
        <AppStateProvider>
            {routes}
        </AppStateProvider>
    </LocaleProvider>,
    document.getElementById('reactApp'));
