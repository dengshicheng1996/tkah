export const regular: {
    [key: string]: {
        name: string,
        reg?: any,
    },
} = {
    unlimited: {
        name: '无限制',
    },
    password: {
        name: '6-20数字或字母',
        reg: '^[0-9a-zA-z]{6,20}$',
    },
    email: {
        name: '邮箱',
        reg: '^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+$',
    },
    phone_number: {
        name: '手机号',
        reg: '^\\d{11}$',
    },
    integer: {
        name: '整数',
        reg: '^-?[1-9]\\d*$',
    },
    decimal: {
        name: '小数',
        reg: '^(-?\\d+)(.\\d+)?$',
    },
    url: {
        name: '网址',
        reg: '[A-Za-z0-9_]+(\\\.[A-Za-z0-9_]+)+',
    },
    chinese_words: {
        name: '汉字',
        reg: '^[\\u4e00-\\u9fa5]{0,}$',
    },
    english_words: {
        name: '英文',
        reg: '^[A-Za-z]+$',
    },
    certification_id: {
        name: '身份证',
        reg: '^[0-9a-zA-z]{18}$',
    },
    phone_or_landline: {
        name: '手机号或者座机',
        reg: '0\\d{2,3}-\\d{7,8}|^1[3456789]\\d{9}$',
    },
};
