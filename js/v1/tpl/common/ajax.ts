import { buildURL } from 'common/url';
import * as $ from 'jquery';

declare const window: any;
$(document).ajaxStart(() => { (window as any).Pace.restart(); });

function countDone(cb: (r: any) => void) {
    return (r: any) => {
        cb(r);
    };
}

export function ajaxUploadPost(url: string, data: object | any, done: (result: any) => void, error: (error: any) => void) {
    $.ajax({
        type: 'POST',
        url,
        data,
        cache: false,
        contentType: false,
        processData: false,
    }).done(countDone(done)).fail(countDone((err) => {
        alert(`网络不稳定，接口请求超时，请稍后重试 !!!`);
        error(err);
    }));
}

export function ajaxPost(url: string, data: object | any, done: (result: any) => void, error: (error: any) => void) {
    $.ajax({
        type: 'POST',
        url,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
    }).done(countDone(done)).fail(countDone((err) => {
        alert(`网络不稳定，接口请求超时，请稍后重试 !!!`);
        error(err);
    }));
}

export function ajaxGet(url: string, done: (result: any) => void, error: (error: any) => void) {
    $.ajax({
        type: 'GET',
        data: { token: window.app && window.app.token ? window.app.token : undefined },
        url,
    }).done(countDone(done)).fail(countDone(error));
}

export function ajaxPostFormData(
    url: string,
    data: FormData,
    done: (result: any) => void,
    error: (error: any) => void) {

    $.ajax({
        type: 'POST',
        url,
        contentType: false,
        data,
        processData: false,
    }).done(countDone(done)).fail(countDone((err) => {
        alert(`网络不稳定，接口请求超时，请稍后重试 !!!`);
        error(err);
    }));
}

export function uploadPostPromise(url: string, data: object): Promise<any> {
    return new Promise((resolve, reject) => {
        ajaxUploadPost(url, data, resolve, reject);
    });
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
