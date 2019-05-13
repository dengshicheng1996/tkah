import { AuthProvider } from 'common/auth';
import * as React from 'react';
import { render } from 'react-dom';
import { AppStateProvider } from './common/appStateStore';
import { routes } from './routes';

render(
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
    </AuthProvider>,
    document.getElementById('reactApp'));
