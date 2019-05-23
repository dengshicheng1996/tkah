const qiniu = require('qiniu-js');

const upload = (data: any, next?: (res: any) => void, onError?: (err: any) => void, complete?: (res: any) => void) => {
    const putExtra: any = {
        fname: this.token.substring(0, 5) + new Date().getTime(),
        params: {},
    };
    const key = this.token.substring(0, 5) + new Date().getTime();
    const obser = qiniu.upload(data.file, key, this.token, putExtra, {});

    obser.subscribe({
        next: (res: any) => {
            next && next(res);
        },
        error: (err: any) => {
            onError && onError(err);
        },
        complete: (res: any) => {
            complete && complete('http://imgcdn.alphae.cn/' + res.key);
        },
    });
};
