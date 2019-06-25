import { postFormDataPromise, postPromise } from 'common/ajax';
import { oc, OCType } from 'common/optchain/getPath';
import { Radium } from 'common/radium';
import { action, autorun, observable, transaction } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

let defaultEndpoint = '';
let defaultLoading = () => <div>Loading...</div>;

export function setDefaultLoading(f: () => React.ReactElement<any>) {
    defaultLoading = f;
}

export interface Request<V> {
    /**
     *
     * @description 请求结构
     * @type {string}
     */
    query: string;
    /**
     * @description 请求数据
     * @type {(V | any)}
     */
    variables?: V;
    /**
     * @description 请求别名
     * @type {(V | any)}
     */
    operationName?: string;
    /**
     *
     * @description 是否重复请求
     * @type {boolean}
     */
    repeat?: boolean;
}

function mapErrors<T extends { errors?: any }>(p: Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        p.then(r => {
            const data: any = r;
            if (!(data instanceof Object)) {
                resolve(r);
                return;
            }
            if (!r['errors']) {
                resolve(r);
                return;
            }
            reject(new Error(JSON.stringify(r, null, 2)));
        }).catch(e => {
            reject(e);
        });
    });
}

export function setDefaultEndpoint(url: string) {
    defaultEndpoint = url;
}

export function gqlPromise<V, R>(
    { endpoint, query, variables, operationName }: {
        endpoint?: string,
    } & Request<V>): Promise<R> {
    endpoint = endpoint || defaultEndpoint;
    if (variables && hasUpload(variables)) {
        const data = new FormData();
        if (operationName) {
            data.append('operationName', operationName);
        }
        data.append('query', query);

        for (const key in variables) {
            if (!variables.hasOwnProperty(key)) {
                continue;
            }
            const v = variables[key];
            if (v instanceof FileList) {
                Array.from(v).forEach(f => data.append(key, f));
            } else {
                if (v instanceof Array) {
                    v.forEach((f) => {
                        if (f instanceof File) {
                            data.append(key, f);
                        }
                    });
                }
            }
        }
        data.append('variables', JSON.stringify(variables));
        return mapErrors(postFormDataPromise(endpoint, data));
    }

    return mapErrors(postPromise(endpoint, {
        query,
        variables,
        operationName,
    }));
}

/**
 *
 * @description 请求结果
 */
type Result<R> = {
    status: 'ok',
    result: WithData<R>,
    oc: OCType<R>,
} | { status: 'error', error: any } | { status: 'loading' };

interface WithData<R> {
    data: R;
}

/**
 *
 * @description 发送请求
 */
interface Refresher {
    /**
     *
     * @description 发送请求
     */
    refresh: () => void;
}

export function mutate<V, R>(req: Request<V>, refreshers?: Refresher[]): Promise<R> {
    return new Promise((resolve, reject) => {
        gqlPromise<V, R>(req).then((r) => {
            resolve(r);
            refreshers.forEach((v) => {
                v.refresh();
            });
        }).catch((err) => {
            reject(err);
        });
    });
}

export class Querier<V = { [name: string]: any }, R = any> {
    /**
     *
     * @description 返回结果
     * @type {Result<R>}
     */
    @observable public result: Result<R>;
    /**
     *
     * @description 请求状态
     * @type {boolean}
     */
    @observable public refreshing: boolean;
    /**
     *
     * @description 请求参数
     * @private
     * @type {Request<V>}
     */
    private req: Request<V>;

    constructor(req: Request<V> = null) {
        // req can be null, if req is null, no query is made.
        this.result = { status: 'loading' };
        Promise.resolve(this.setReq(req || null));
    }

    /**
     *
     * @description 获取请求参数
     * @returns {Request<V>}
     */
    public getReq(): Request<V> {
        return this.req;
    }

    /**
     *
     * @description 设置请求参数
     * @param {Request<V>} r
     * @returns {Promise<void>}
     */
    public setReq(r: Request<V>): Promise<void> {
        if (r && !r.repeat && this.req && this.req.operationName === r.operationName && this.req.query === r.query && JSON.stringify(this.req.variables) === JSON.stringify(r.variables)) {
            return;
        }
        this.req = r;
        return this.refresh();
    }

    /**
     *
     * @description 设置请求数据
     * @param {V} v
     * @returns {Promise<void>}
     */
    public setVariables(v: V): Promise<void> {
        if (JSON.stringify(this.req.variables) === JSON.stringify(v)) {
            return;
        }
        this.req.variables = v;
        return this.refresh();
    }

    /**
     *
     * @description 发送请求
     * @param {V} [variables]
     * @returns {Promise<void>}
     */
    @action public refresh(variables?: V): Promise<void> {
        if (this.req === null) {
            this.result = { status: 'loading' };
            return null;
        }

        if (variables) {
            this.req.variables = Object.assign({}, this.req.variables || {}, variables);
        } else {
            variables = this.req.variables;
        }

        this.refreshing = true;
        if (this.result.status === 'error') {
            this.result = { status: 'loading' };
        }
        return gqlPromise<V, WithData<R>>(this.req).then(action((r: WithData<R>) => {
            this.refreshing = false;
            if (this.req.variables === variables) {
                this.result = {
                    status: 'ok',
                    result: r,
                    oc: oc(r.data),
                };
            }
            return;
        })).catch(action((err) => {
            this.refreshing = false;
            if (this.req.variables === variables) {
                this.result = { status: 'error', error: err };
            }
            throw err;
        }));
    }
}

export class GQLCache {
    endpoint: string;
    cache: { [key: string]: any };

    constructor({ endpoint }: { endpoint?: string }) {
        this.endpoint = endpoint;
        this.cache = {};
    }

    public query<V, R>(req: Request<V>): Promise<R> {
        const key = JSON.stringify(req);
        const value = this.cache[key];
        if (value === undefined) {
            return this.promise<V, R>(req).then((resp) => {
                this.cache[key] = resp;
                return resp;
            });
        }
        return new Promise((resolve, reject) => {
            resolve(value);
        });
    }

    public mutate<V, R>(req: Request<V>): Promise<R> {
        return this.promise(req);
    }

    private promise<V, R>(req: Request<V>): Promise<R> {
        return gqlPromise<V, R>({
            endpoint: this.endpoint,
            query: req.query,
            variables: req.variables,
            operationName: req.operationName,
        });
    }
}

function hasUpload(variables: { [key: string]: any }): boolean {
    for (const key in variables) {
        if (!variables.hasOwnProperty(key)) {
            continue;
        }
        const v = variables[key];
        if (v instanceof FileList) {
            return true;
        }

        if (!v || !v.length) {
            continue;
        }

        for (const obj in v) {
            if (!v.hasOwnProperty(obj)) {
                continue;
            }
            if (v[obj] instanceof File) {
                return true;
            }
        }

    }
    return false;
}

export function pendingMessage(result: any) {
    if (result && result.status === 'error') {
        return `Error: ${JSON.stringify(result.error)}`;
    }
    if (result && result.status === 'ok') {
        return;
    }

    return '正在调取数据和分析图表……';
}

@Radium
@observer
export class QueryContainer<V, R> extends React.Component<{
    query: string,
    vars: V,
    updateSeq?: number,
    ok: (r: R) => React.ReactElement<any>,
    didUpdate?: (r: R) => void,
    loading?: () => React.ReactElement<any>,
    error?: (errMsg: string) => React.ReactElement<any>,
}> {
    querier = new Querier<V, R>();
    private updateSeq: number;

    componentDidMount() {
        this.updateSeq = this.props.updateSeq;

        autorun(() => {
            if (this.querier.result.status === 'ok' && this.props.didUpdate) {
                this.props.didUpdate(this.querier.result.result.data);
            }
        });

        this.querier.setReq({
            query: this.props.query,
            variables: this.props.vars,
        });
    }

    componentDidUpdate() {
        this.querier.setReq({
            query: this.props.query,
            variables: this.props.vars,
            repeat: this.updateSeq !== this.props.updateSeq,
        });
        this.updateSeq = this.props.updateSeq;
    }

    render() {
        if (this.querier.result.status === 'loading') {
            if (this.props.loading) {
                return this.props.loading();
            }
            return defaultLoading();
        }

        if (this.querier.result.status === 'error') {
            // TODO: Make error rendering look better.
            const errMsg = (() => {
                const err = this.querier.result.error;
                if (err instanceof Error) {
                    return err.message;
                }
                return JSON.stringify(this.querier.result.error);
            })();
            if (this.props.error) {
                return this.props.error(errMsg);
            }
            return <div>Error: {errMsg}</div>;
        }

        return this.props.ok(this.querier.result.result.data);
    }
}
