import { ajaxPromise, getPromise, postFormDataPromise, postPromise } from 'common/ajax';
import { action, observable } from 'mobx';

export interface Request<V> {
    /**
     *
     * @description 请求url
     * @type {string}
     */
    url?: string;
    /**
     *
     * @description 请求方式
     * @type {string}
     */
    method?: string;
    /**
     * @description 请求数据
     * @type {(V | any)}
     */
    variables?: V | any;
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

export function gqlPromise<V, R>(
    { url, method, variables }: Request<V>): Promise<R> {
    if (variables && hasUpload(variables)) {
        const data = new FormData();

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
        return mapErrors(postFormDataPromise(url, data));
    }

    const ajaxMethod = method || 'post';

    switch (ajaxMethod.toLowerCase()) {
        case 'get':
            return mapErrors(getPromise(url, variables));
        case 'post':
            return mapErrors(postPromise(url, variables));
        default:
            return mapErrors(ajaxPromise(url, method, variables));
    }
}

/**
 *
 * @description 请求结果
 */
type Result<R> = { status: 'ok', result: R } | { status: 'error', error: any } | { status: 'loading' };

/**
 *
 * @description 发送请求
 */
interface Refresher {
    /**
     *
     * @description 发送请求
     *
     */
    refresh: () => void;
}
function test401(r: any) {
    if (r.status_code === 401 && window.location.href.indexOf('management') > -1) {
        window.location.href = '/management/user/login';
    }
}
export function mutate<V, R>(req: Request<V>, refreshers?: Refresher[]): Promise<R> {
    return new Promise((resolve, reject) => {
        gqlPromise<V, R>(req).then((r) => {
            test401(r);
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
        if (r && r.repeat !== true && JSON.stringify(this.req) === JSON.stringify(r)) {
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
        return gqlPromise<V, R>(this.req).then(action((r: R) => {
            this.refreshing = false;
            if (this.req.variables === variables) {
                this.result = { status: 'ok', result: r };
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
