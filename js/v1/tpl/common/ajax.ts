import axios from 'axios';
import { buildURL } from 'common/url';
import * as $ from 'jquery';
$(document).ajaxStart(() => { (window as any).Pace.restart(); });

function countDone(cb: (r: any) => void) {
    return (r: any) => {
        cb(r.data);
    };
}

function countErrorDone(cb: (r: any) => void) {
    return (r: any) => {
        cb(r);
    };
}

export function ajaxPost(url: string, data: object, done: (result: any) => void, error: (error: any) => void) {
    axios({
        method: 'POST',
        url,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        data: JSON.stringify(data),
    }).then(countDone(done)).catch(countErrorDone((err) => {
        console.warn(url, err);
        error(err);
    }));
}

export function ajaxGet(url: string, done: (result: any) => void, error: (error: any) => void) {
    axios({
        method: 'GET',
        url,
    }).then(countDone(done)).catch(countErrorDone(error));
}

export function ajaxPostFormData(
    url: string,
    data: FormData,
    done: (result: any) => void,
    error: (error: any) => void) {

    axios({
        method: 'POST',
        url,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        data,
    }).then(countDone(done)).catch(countErrorDone(error));
}

export function postPromise(url: string, data: object): Promise<any> {
    return new Promise((resolve, reject) => {
        ajaxPost(url, data, resolve, reject);
    });
}

export function getPromise(url: string, param?: object): Promise<any> {
    const full = buildURL(url, param);
    return new Promise((resolve, reject) => {
        ajaxGet(full, resolve, reject);
    });
}

export function postFormDataPromise(url: string, data: FormData): Promise<any> {
    return new Promise((resolve, reject) => {
        ajaxPostFormData(url, data, resolve, reject);
    });
}
