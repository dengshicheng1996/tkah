import * as _ from 'lodash';

export const GetSiteConfig = (siteConfigState: any, type: 'style', arg?: string) => {
    const { site, platform } = siteConfigState;
    let defaultSiteC: any = {};
    let platformC: any = {};

    if (type === 'style') {
        defaultSiteC = {
            baseLayout: {
                bg: {
                    backgroundColor: '#2C3347',
                },
                version: {
                    fontFamily: 'PingFangSC-Medium',
                    height: '18px',
                    borderRadius: '2px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    letterSpacing: '0.6px',
                    lineHeight: '18px',
                    padding: '0 5px',
                    display: 'inline-block',
                    backgroundColor: '#6BBB12',
                },
                shade: {
                    backgroundColor: 'transparent',
                },
                menu: {
                    selected: {
                        backgroundColor: 'rgba(0, 0, 0, 0.16)',
                        borderLeft: '6px solid #E55800',
                    },
                    selectColor: '#E55800 !important',
                },
            },
        };
        platformC = {
            baseLayout: {
                bg: {
                    backgroundImage: 'url(/images/bg.png)',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                },
            },
        };
    }

    let siteConfigData = defaultSiteC;

    if (platformC) {
        if (platformC[site]) {
            siteConfigData = platformC[site];
        } else {
            if (platformC['default']) {
                siteConfigData = platformC['default'];
            }
        }
    }
    if (arg) {
        let data: any = _.get(siteConfigData, arg);
        if (data === undefined) {
            data = _.get(defaultSiteC, arg);
        }
        return data;
    }

    return siteConfigData ? siteConfigData : defaultSiteC;
};

export const menuTitle = [
    {
        title: '欢迎使用',
        url: 'home',
    },
    {
        title: '基础配置',
        url: 'basic',
        children: [
            {
                title: '初始化配置',
                url: 'init',
                children: [
                    {
                        title: '产品配置',
                        url: 'product',
                    },
                    {
                        title: '合同配置',
                        url: 'contract',
                    },
                    {
                        title: 'APP配置',
                        url: 'appSet',
                    },
                    {
                        title: '合同签章',
                        url: 'signature',
                    },
                    {
                        title: '客户信息',
                        url: 'clientInfo',
                    },
                ],
            },
            {
                title: '渠道配置',
                url: 'channel',
            },
            {
                title: '账号管理',
                url: 'account',
            },
            {
                title: '角色权限',
                url: 'role',
            },
        ],
    },
    {
        title: '客户管理',
        url: 'custorm',
        children: [
            {
                title: '客户列表',
                url: 'list',
                children: [
                    {
                        title: '客户详情',
                        url: 'id',
                    },
                ],
            },
            {
                title: '渠道访问记录',
                url: 'channelRecord',
            },
        ],
    },
    {
        title: '授信放款',
        url: 'credit',
        children: [
            {
                title: '审核授信',
                url: 'audit',
                children: [
                    {
                        title: '审核详情',
                        url: 'id',
                    },
                ],
            },
            {
                title: '提现放款',
                url: 'withdraw',
                children: [
                    {
                        title: '放款详情',
                        url: 'id',
                    },
                ],
            },
        ],
    },
    {
        title: '贷后管理',
        url: 'afterLoaning',
    },
    {
        title: '消费和支付交易',
        url: 'consumption',
        children: [
            {
                title: '查询计费',
                url: 'billing',
            },
            {
                title: '短信记录',
                url: 'note',
            },
            {
                title: '支付流水',
                url: 'payOrder',
            },
        ],
    },
];

export const GetCookie = (cname: string) => {
    const name = cname + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return;
};

export const SetCookie = (name: string, value: any, time: number) => {
    const now = new Date();
    now.setTime(now.getTime() + time * 60 * 60 * 1000);
    const domain = `domain=${document.domain};`;
    const expires = `expires=${now.toUTCString()};`;
    document.cookie = `${name}=${escape(value)};path=/;${expires}${domain}`;
};
