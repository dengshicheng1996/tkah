import { AuthProvider } from 'common/auth';
import * as React from 'react';
import { render } from 'react-dom';
import { AppStateProvider } from './common/appStateStore';
import { routes } from './routes';

render(
    <AuthProvider>
        <AppStateProvider>
            {routes}
        </AppStateProvider>
    </AuthProvider>,
    document.getElementById('reactApp'));
