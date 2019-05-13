import { getPromise, postPromise } from 'common/ajax';
import { makeError, makeResult, Result } from 'common/types';
import * as $ from 'jquery';
import 'jquery.cookie';
import * as _ from 'lodash';
import { observable } from 'mobx';
import { inject, observer, Provider } from 'mobx-react';
import * as React from 'react';

interface AuthAPIStatus {
    status: 'guest' | 'user';
    error?: string;
    error_key?: string;
}

interface Config {
    statusURL: string;
    loginURL: string;
    logoutURL: string;
    sendCodeURL: string;
}

export function defaultConfig(c?: { prefix?: string }): Config {
    const prefix = (c && c.prefix) || '';
    return {
        statusURL: prefix + '/api/logged',
        loginURL: prefix + '/api/login',
        logoutURL: prefix + '/api/logout',
        sendCodeURL: prefix + '/api/sendCode',
    };
}

export function defaultLoginURL(): string {
    return '/user/login';
}

export class AuthStore {
    @observable status: { state: 'user' }
        | { state: 'guest' }
        | { state: 'loading' }
        | { state: 'error', err: string, error_key: string };

    config: Config;
    loginURL: string;

    constructor(config: Config, loginURL: string) {
        this.config = config;
        this.loginURL = loginURL;
        this.update();
    }

    update() {
        this.status = { state: 'loading' };
        getPromise(this.config.statusURL).then((r: AuthAPIStatus) => {
            this.status = {
                state: 'user',
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

        if (!r || !r.error) {
            return makeResult(r);
        }

        return makeError(this.getErrorMessage(r.error), r.error_key);

    }

    async sendCode({
        phone, kind, voiceCode, aliSessionId, aliToken, aliSig, aliScene }: {
            phone: string, kind?: string, voiceCode?: boolean, aliSessionId?: string, aliToken?: string, aliSig?: string, aliScene?: string,
        }):
        Promise<Result<void, string, string>> {

        const parms: any = {};
        if (phone) {
            parms['phone'] = phone;
        }

        if (kind) {
            parms['kind'] = kind;
        }

        if (voiceCode) {
            parms['voiceCode'] = voiceCode;
        }

        if (aliSessionId) {
            parms['aliSessionId'] = aliSessionId;
        }

        if (aliToken) {
            parms['aliToken'] = aliToken;
        }

        if (aliSig) {
            parms['aliSig'] = aliSig;
        }

        if (aliScene) {
            parms['aliScene'] = aliScene;
        }

        const r = await this.doPost(this.config.sendCodeURL, parms);

        if (r.kind === 'error') {
            this.update();
        }
        return r;
    }

    async login(
        { username, phone, identifier, password }:
            {
                username?: string,
                phone?: string,
                identifier?: string,
                password?: string,
            },
    ): Promise<Result<void, string, string>> {
        this.status = { state: 'loading' };
        if (!identifier && !phone && !username) {
            return { kind: 'error', error: 'UserName are empty', error_key: 'error_message' };
        }
        const parms: any = {};
        parms['password'] = password;

        if (identifier) {
            parms['identifier'] = identifier;
        }

        if (phone) {
            parms['mobile'] = phone;
        }

        if (username) {
            parms['username'] = username;
        }

        const r = await this.doPost(this.config.loginURL, parms);

        if (r.kind === 'error' || (r.result && !r.result.data.token)) {
            this.update();
        } else {
            $.cookie('token', r.result.data.token);
            this.status = {
                state: 'user',
            };
        }
        return r;
    }

    logout() {
        this.status = { state: 'loading' };
        getPromise(this.config.logoutURL).then(() => {
            this.update();
        });
    }
}

export class AuthProvider extends React.Component<{ config?: Config, loginURL?: string }, {}> {
    private store: AuthStore;
    constructor(props: { config?: Config, loginURL?: string }, context: any) {
        super(props, context);
        const config = props.config || defaultConfig();
        const loginURL = props.loginURL || defaultLoginURL();
        this.store = new AuthStore(config, loginURL);
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
                    props.history.push(`${auth.loginURL}${window.location.search}`);

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
                    props.history.push(`${auth.loginURL}${window.location.search}`);
                    return <div>Error: {auth.status.err}<br />Please reload this page.</div>;
                default:
                    const unused: never = auth.status;
            }
        }) as any);
    };
}
