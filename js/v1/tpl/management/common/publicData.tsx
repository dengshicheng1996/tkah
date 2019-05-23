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

export const ApiUrls = [
    {
        value: 'alpha1',
        label: 'alpha',
    },
    {
        value: 'alpha2',
        label: 'alphacaihong',
    },
    {
        value: 'alpha3',
        label: 'alphacaihong2',
    },
    {
        value: 'alpha4',
        label: 'alphacaihong3',
    },
    {
        value: 'alpha11',
        label: 'alphacaihong4',
    },
    {
        value: 'alpha13',
        label: 'alphacaihong5',
    },
    {
        value: 'alpha14',
        label: 'alphacaihong6',
    },
    {
        value: 'alpha5',
        label: '王苗苗',
    },
    {
        value: 'alpha6',
        label: '刘哲',
    },
    {
        value: 'alpha7',
        label: '刘玉娇',
    },
    {
        value: 'alpha8',
        label: '刘哲',
    },
    {
        value: 'alpha9',
        label: '孟晓宁',
    },
    {
        value: 'alpha10',
        label: '段志磊',
    },
    {
        value: 'alpha12',
        label: '李明尚',
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
