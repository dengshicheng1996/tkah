import * as React from 'react';
import { render } from 'react-dom';
import './common/antd_theme.less';
import { routes } from './routes';

render(
    <div>
        {routes}
    </div>,
    document.getElementById('reactApp'));
