import { mutate } from './component/restFull';
import { GetUuid } from './fun';

const qiniu = require('qiniu-js');

export const QiNiuUpload = async (blob: Blob, callBack?: { next?: (res: any) => void, onError?: (err: any) => void, complete?: (res: any) => void }) => {
    const json = {
        bucketName: 'tk-file-zone',
    };

    const resData = await mutate<{}, any>({
        url: '/api/admin/upload/updateToken',
        method: 'post',
        variables: json,
    });

    const token = resData.data;

    const putExtra: any = {
        fname: token.substring(0, 5) + new Date().getTime(),
        params: {},
    };

    const key = GetUuid(15);
    const obser = qiniu.upload(blob, key, token, putExtra, {});

    obser.subscribe({
        next: (res: any) => {
            callBack.next && callBack.next(res);
        },
        error: (err: any) => {
            callBack.onError && callBack.onError(err);
        },
        complete: (res: any) => {
            callBack.complete && callBack.complete('http://imgcdn.alphae.cn/' + res.key);
        },
    });
};
