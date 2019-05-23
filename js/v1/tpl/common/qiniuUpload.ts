const qiniu = require('qiniu-js');

const upload = (data: any) => {
    const putExtra: any = {
        fname: this.token.substring(0, 5) + new Date().getTime(),
        params: {},
    };
    const key = this.token.substring(0, 5) + new Date().getTime();
    const obser = qiniu.upload(data.file, key, this.token, putExtra, {});
    obser.subscribe({
        next: (res: any) => {
            this.props.next && this.props.next(res);
        },
        error: (err: any) => {
            this.props.onError && this.props.onError(err);
        },
        complete: (res: any) => {
            this.props.complete && this.props.complete('http://imgcdn.alphae.cn/' + res.key);
        },
    });
};
