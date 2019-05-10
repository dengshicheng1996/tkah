import { ajaxPromise, getPromise, postFormDataPromise, postPromise } from 'common/ajax';
import { action, observable } from 'mobx';

export interface Request<V> {
    url?: string;
    method?: string;
    variables?: V | any;
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

    switch (method) {
        case 'get':
            return mapErrors(getPromise(url, variables));
        case 'post':
            return mapErrors(postPromise(url, variables));
        default:
            return mapErrors(ajaxPromise(url, method, variables));
    }
}

type Result<R> = { status: 'ok', result: R } | { status: 'error', error: any } | { status: 'loading' };

interface Refresher {
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
    @observable public result: Result<R>;
    @observable public refreshing: boolean;
    private req: Request<V>;

    constructor(req: Request<V> = null) {
        // req can be null, if req is null, no query is made.
        this.result = { status: 'loading' };
        Promise.resolve(this.setReq(req || null));
    }

    public getReq(): Request<V> {
        return this.req;
    }

    public setReq(r: Request<V>): Promise<void> {
        if (r && r.repeat !== true && JSON.stringify(this.req) === JSON.stringify(r)) {
            return;
        }
        this.req = r;
        return this.refresh();
    }

    public setVariables(v: V): Promise<void> {
        if (JSON.stringify(this.req.variables) === JSON.stringify(v)) {
            return;
        }
        this.req.variables = v;
        return this.refresh();
    }

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
