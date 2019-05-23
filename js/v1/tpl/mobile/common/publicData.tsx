import { Browser } from 'common/sys';

export const ConvertBase64UrlToBlob = (data: string) => {
    const bytes = window.atob(data); // 去掉url的头，并转换为byte

    // 处理异常,将ascii码小于0的转换为大于0
    const ab = new ArrayBuffer(bytes.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }

    return new Blob([ab], { type: 'image/jpg' });
};

/**
 *
 * 生成UUID
 */
export const GetUuid = (len?: number, radix?: number) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    const uuid = [];
    let i;
    radix = radix || chars.length;

    if (len) {
        for (i = 0; i < len; i++) {
            // tslint:disable-next-line:no-bitwise
            uuid[i] = chars[0 | (Math.random() * radix)];
        }
    } else {
        let r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                // tslint:disable-next-line:no-bitwise
                r = 0 | (Math.random() * 16);
                // tslint:disable-next-line:no-bitwise
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
};
