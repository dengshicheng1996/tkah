export const SearchToObject = (searchString: string) => {
    if (!searchString) {
        return {};
    }

    return searchString
        .substring(1)
        .split('&')
        .reduce((result: any, next: any) => {
            const pair = next.split('=');
            result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);

            return result;
        }, {});
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
            uuid[i] = chars[0 | (Math.random() * radix)];
        }
    } else {
        let r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | (Math.random() * 16);
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join('');
};
