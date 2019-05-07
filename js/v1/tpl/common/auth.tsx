import { getPromise, postPromise } from 'common/ajax';
import { appFn } from 'common/app';
import { makeError, makeResult, Result } from 'common/types';
import * as _ from 'lodash';
import { observable } from 'mobx';
import { inject, observer, Provider } from 'mobx-react';
import * as React from 'react';
import { ActivityIndicator } from './antd/mobile/activity-indicator';

interface User {
    name?: string;
    email?: string;
    tags?: [string];
    email_verified?: boolean;
    id: string;
    token: string;
    phone?: string;
}

interface AuthAPIStatus {
    status: 'guest' | 'user';
    user_id?: string;
    user_name?: string;
    user_email?: string;
    user_tags?: [string];
    token: string;
    email_verified?: boolean;
    user_phone?: string;
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
        statusURL: prefix + '/auth/status',
        loginURL: prefix + '/auth/login',
        logoutURL: prefix + '/auth/logout',
        sendCodeURL: prefix + '/auth/sendCode',
    };
}

export class AuthStore {
    @observable status: { state: 'user', user: User }
        | { state: 'guest' }
        | { state: 'loading' }
        | { state: 'error', err: string, error_key: string };

    config: Config;

    constructor(config: Config) {
        this.config = config;
        this.update();
    }

    update() {
        this.status = { state: 'loading' };
        getPromise(this.config.statusURL).then((r: AuthAPIStatus) => {
            if (r.status === 'guest') {
                this.status = { state: 'guest' };
                return;
            }
            if (r.status === 'user') {
                this.status = {
                    state: 'user',
                    user: {
                        id: r.user_id,
                        name: r.user_name,
                        email: r.user_email,
                        phone: r.user_phone,
                        tags: r.user_tags,
                        email_verified: r.email_verified,
                        token: r.token,
                    },
                };
                return;
            }
            this.setError('unknown result');
        }).catch((err) => {
            this.setError(err);
        });
    }

    getErrorMessage(err: any): string {
        if (_.isString(err)) {
            return err;
        }
        if (err instanceof Object) {
            if (err.hasOwnProperty('responseText')) {
                return err.responseText;
            }
            if (err.hasOwnProperty('error') && _.isString(err.error)) {
                return err.error;
            }
        }
        return 'Error: ' + JSON.stringify(err);
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
        phone, cid, kind, voiceCode, aliSessionId, aliToken, aliSig, aliScene }: {
            phone: string, cid?: number, kind?: string, voiceCode?: boolean, aliSessionId?: string, aliToken?: string, aliSig?: string, aliScene?: string,
        }):
        Promise<Result<void, string, string>> {

        const parms: any = {};
        if (phone) {
            parms['phone'] = phone;
        }

        if (cid) {
            parms['cid'] = cid;
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
        { email, username, phone, identifier, password, verifyCode, cid, channelId }:
            {
                email?: string,
                username?: string,
                phone?: string,
                identifier?: string,
                password?: string,
                verifyCode?: string,
                cid?: number,
                channelId?: number,
            },
    ): Promise<Result<void, string, string>> {
        this.status = { state: 'loading' };
        if (!email && !username && !identifier && !phone) {
            return { kind: 'error', error: 'Email , username and phone are empty', error_key: 'error_message' };
        }
        const parms: any = {};
        parms['password'] = password;
        if (email) {
            parms['email'] = email;
        }
        if (username) {
            parms['username'] = username;
        }
        if (identifier) {
            parms['identifier'] = identifier;
        }
        if (phone) {
            parms['phone'] = phone;
        }

        if (verifyCode) {
            parms['verifyCode'] = verifyCode;
        }
        if (cid) {
            parms['cid'] = cid;
        }
        if (channelId) {
            parms['channelId'] = channelId;
        }

        const r = await this.doPost(this.config.loginURL, parms);

        if (r.kind === 'error' || r.result.status !== 1) {
            this.update();
        } else {
            this.status = {
                state: 'user', user: {
                    id: r.result.user_id,
                    name: r.result.user_name,
                    email: r.result.user_email,
                    phone: r.result.user_phone,
                    tags: r.result.user_tags,
                    token: r.result.token,
                    email_verified: r.result.email_verified,
                },
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

export class AuthProvider extends React.Component<{ config?: Config }, {}> {
    private store: AuthStore;
    constructor(props: { config?: Config }, context: any) {
        super(props, context);
        const config = props.config || defaultConfig();
        this.store = new AuthStore(config);
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
    const loginURL = `/ylxd/user${window.location.search}`;
    return loginRequiredWithOptions({ loginURL })(component);
}

export function loginRequiredWithOptions(opt: { loginURL: string }): <C extends {}>(component: C) => C {
    return <C extends {}>(component: C): C => {
        const Component: any = component;
        return withAuth(((props: { auth: AuthStore }) => {
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
                            <ActivityIndicator
                                toast
                                text='身份验证中……'
                            />
                        </div>
                    );
                case 'guest':
                    window.location.assign(opt.loginURL);

                    return (
                        <div style={{
                            position: 'fixed',
                            textAlign: 'center',
                            width: '100%',
                            height: '100%',
                            paddingTop: '30%',
                        }}>
                            <ActivityIndicator
                                toast
                                text='前往登录中……'
                            />
                        </div>
                    );
                case 'user':
                    return <Component {...props} />;
                case 'error':
                    return <div>Error: {auth.status.err}<br />Please reload this page.</div>;
                default:
                    const unused: never = auth.status;
            }
        }) as any);
    };
}
