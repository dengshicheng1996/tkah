import { ajaxPromise, getPromise, postPromise } from 'common/ajax';
import { AppFn, IsAppPlatform } from 'common/app';
import { makeError, makeResult, Result } from 'common/types';
import * as $ from 'jquery';
import 'jquery.cookie';
import * as _ from 'lodash';
import { observable } from 'mobx';
import { inject, observer, Provider } from 'mobx-react';
import * as React from 'react';
import { message } from '../antd/message';

interface AuthAPIStatus {
    status_code: number;
    message?: string;
    data?: any;
}

interface Config {
    statusURL?: string;
    loginURL?: string;
    registerURL?: string;
    logoutURL?: string;
    sendCodeURL?: string;
}

export function defaultConfig(c?: { prefix?: string }): Config {
    const prefix = (c && c.prefix) || '';
    return {
        statusURL: prefix + '/api/logged',
        loginURL: prefix + '/api/login',
        registerURL: prefix + '/api/register',
        logoutURL: prefix + '/api/logout',
        sendCodeURL: prefix + '/api/sendCode',
    };
}

export function defaultLoginURL(): string {
    return '/user/login';
}

export function defaultRefreshtoType(): string {
    return 'react-router';
}

export class AuthStore {
    @observable status: { state: 'user' }
        | { state: 'guest' }
        | { state: 'loading' }
        | { state: 'error', err: string, error_key: string };

    refreshtoType: string;
    config: Config;
    loginURL: string;

    constructor(config: Config, loginURL: string, refreshtoType: string) {
        this.config = config;
        this.loginURL = loginURL;
        this.refreshtoType = refreshtoType;
        this.update();
    }

    update() {
        this.status = { state: 'loading' };
        getPromise(this.config.statusURL).then((r: AuthAPIStatus) => {
            if (r.status_code === 200) {
                this.status = {
                    state: 'user',
                };
                return;
            }
            this.status = {
                state: 'guest',
            };
        }).catch((err) => {
            if (err.response) {
                this.status = {
                    state: 'guest',
                };
            } else {
                console.log('Error', err);
            }
            this.setError(err);
        });
    }

    getErrorMessage(err: any): string {
        if (_.isString(err)) {
            return err;
        }

        if (err instanceof Object) {
            if (err.hasOwnProperty('response')) {
                if (err.response.data && err.response.data.message) {
                    return err.response.data.message;
                }
                if (err.response.status) {
                    return err.response.status;
                }
            }
        }

        return `Error: ${JSON.stringify(err.config)}`;
    }

    setError(err: any) {
        console.log('auth error', err);
        this.status = { state: 'error', err: this.getErrorMessage(err), error_key: 'error_message' };
    }

    async doPost(url: string, param: any): Promise<Result<any, string, string>> {
        let r;
        try {
            r = await postPromise(url, param);
        } catch (e) {
            return makeError(this.getErrorMessage(e), 'error_message');
        }

        if ((!r || !r.error) && r.status_code === 200) {
            return makeResult(r);
        }

        return makeError(this.getErrorMessage(r.error || r.message), r.error_key);
    }

    async doMethod(url: string, param: any, method: string = 'post'): Promise<Result<any, string, string>> {
        let r;
        try {
            r = await ajaxPromise(url, method, param);
        } catch (e) {
            return makeError(this.getErrorMessage(e), 'error_message');
        }

        if (!r || !r.error) {
            return makeResult(r);
        }

        return makeError(this.getErrorMessage(r.error), r.error_key);
    }

    async sendCode(obj: {
        phone: string,
        kind?: string,
        voiceCode?: boolean,
        aliSessionId?: string,
        aliToken?: string,
        aliSig?: string,
        aliScene?: string,
    }):
        Promise<Result<void, string, string>> {

        const r = await this.doPost(this.config.sendCodeURL, obj);

        if (r.kind === 'error') {
            this.update();
        }
        return r;
    }

    async mobileRegister(
        obj: { mobile: string, code: string, channel_id_code: string }):
        Promise<Result<void, string, string>> {
        this.status = { state: 'loading' };

        const r = await this.doPost(this.config.registerURL, obj);

        if (r.kind === 'error') {
            this.update();
        } else {
            this.status = {
                state: 'user',
            };
        }
        return r;
    }

    async mobileSendCode(obj: {
        mobile: string,
        channel_id_code: string,
        aliSessionId?: string,
        aliToken?: string,
        aliSig?: string,
        aliScene?: string,
    }):
        Promise<Result<void, string, string>> {
        const r = await this.doPost(this.config.sendCodeURL, obj);

        if (r.kind === 'error') {
            this.update();
        }
        return r;
    }

    async login(
        obj: {
            username?: string,
            phone?: string,
            identifier?: string,
            password?: string,
            [key: string]: string,
        },
        plat?: string,
    ): Promise<Result<void, string, string>> {
        this.status = { state: 'loading' };
        const { username, phone, identifier, name } = obj;
        if (!identifier && !phone && !username && !name) {
            return { kind: 'error', error: 'UserName are empty', error_key: 'error_message' };
        }

        const r: any = await this.doPost(this.config.loginURL, obj);
        if (r.kind === 'error' || (r.result && !r.result.data) || (r.result && !r.result.data.token)) {
            this.update();
        } else {
            $.cookie('token', r.result.data.token, { path: plat });
            this.status = {
                state: 'user',
            };
        }
        return r;
    }

    async logout(): Promise<Result<void, string, string>> {
        this.status = { state: 'loading' };
        const r = await this.doMethod(this.config.logoutURL, {}, 'delete');
        if (r.kind === 'error') {
            this.update();
        } else {
            this.status = {
                state: 'guest',
            };
        }

        return r;
    }
}

export class AuthProvider extends React.Component<{ config?: Config, loginURL?: string, refreshtoType?: string }, {}> {
    private store: AuthStore;
    constructor(props: { config?: Config, loginURL?: string, refreshtoType?: string }, context: any) {
        super(props, context);
        const config = props.config || defaultConfig();
        const loginURL = props.loginURL || defaultLoginURL();
        const refreshtoType = props.refreshtoType || defaultRefreshtoType();

        this.store = new AuthStore(config, loginURL, refreshtoType);
    }

    render() {
        return <Provider auth={this.store}>
            {this.props.children}
        </Provider>;
    }
}

export interface WithAuth {
    auth?: AuthStore;
}

export function withAuth<C extends {}>(component: C): C {
    return inject('auth')(observer(component as any));
}

export function loginRequired<C extends {}>(component: C): C {
    return loginRequiredWithOptions()(component);
}

export function loginRequiredWithOptions(): <C extends {}>(component: C) => C {
    return <C extends {}>(component: C): C => {
        const Component: any = component;
        return withAuth(((props: { auth: AuthStore, history: any }) => {
            const auth: AuthStore = props.auth;
            let search = window.location.search;
            if (auth.loginURL.indexOf('?') !== -1) {
                if (auth.loginURL.indexOf('next=') !== -1) {
                    search = '';
                } else {
                    search = search.replace('?', '&');
                }
            }

            switch (auth.status.state) {
                case 'loading':
                    return (
                        <div style={{
                            position: 'fixed',
                            textAlign: 'center',
                            width: '100%',
                            height: '100%',
                            paddingTop: '30%',
                        }}>
                            身份验证中……
                        </div>
                    );
                case 'guest':
                    jump(auth, search, props);

                    return (
                        <div style={{
                            position: 'fixed',
                            textAlign: 'center',
                            width: '100%',
                            height: '100%',
                            paddingTop: '30%',
                        }}>
                            前往登录中……
                        </div>
                    );
                case 'user':
                    return <Component {...props} />;
                case 'error':
                    jump(auth, search, props);

                    return <div>Error: {auth.status.err}<br />Please reload this page.</div>;
                default:
                    const unused: never = auth.status;
            }
        }) as any);
    };
}

const jump = (auth: AuthStore, search: string, props: { auth?: AuthStore; history: any; }) => {
    if (IsAppPlatform()) {
        AppFn.jumpToLogin();
    } else {
        if (auth.refreshtoType === 'react-router') {
            props.history.push(`${auth.loginURL}${search}`);
        } else if (auth.refreshtoType === 'window') {
            window.location.href = `${auth.loginURL}${search}`;
        }
    }
};
