import { AuthProvider } from 'common/component/auth';
import * as $ from 'jquery';
import * as React from 'react';
import { render } from 'react-dom';
import { routes } from './routes';

import { AppFn, InitBtn, NavBarBack, NavBarTitle } from 'common/app';
import { SearchToObject } from 'common/fun';
import 'mobile/common/antd_theme.less';
import { AppStateProvider } from 'mobile/common/appStateStore';
import 'mobile/common/showEruda';

declare const window: any;

if (SearchToObject(window.location.search)['zdgj_token']) {
    $.cookie('token', SearchToObject(window.location.search)['zdgj_token'], { path: '/' });
}

if (SearchToObject(window.location.search)['apply_id']) {
    $.cookie('apply_id', SearchToObject(window.location.search)['apply_id'], { path: '/' });
}

window.navbar = {};

AppFn.stopLoading();

AppFn.setConfig({
    backDic: {
        isHidden: 0,
        appFun: 0,
        img: 1,
    },
    closeDic: {
        isHidden: 1,
        appFun: 0,
        img: 2,
    },
    finishDic: {
        isHidden: 0,
        appFun: 0,
        img: 3,
    },
});

InitBtn();
NavBarBack();
NavBarTitle('提现');

render(
    <AuthProvider loginURL='/promotion/user/login?next=/withdraw/home'
        refreshtoType='window'
        config={{
            statusURL: '/api/mobile/logged',
            loginURL: '/api/wap/login',
            registerURL: '/api/wap/register',
            logoutURL: '/api/wap/logout',
            sendCodeURL: '/api/wap/sendverifycode',
        }}>
        <AppStateProvider>
            {routes}
        </AppStateProvider>
    </AuthProvider>,
    document.getElementById('reactApp'));
