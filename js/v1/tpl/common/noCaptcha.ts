import * as _ from 'lodash';
import { Browser } from './sys';

declare const noCaptcha: any;
declare const NoCaptcha: any;

export const noCaptchaObj = (config: {
    nc_token?: string,
    NC_Opt?: { [key: string]: any },
    upLang?: {
        lang?: string,
        obj: { [key: string]: any },
    },
}) => {
    try {
        if (!config.NC_Opt.appkey) {
            throw new Error('Required appKey');
        }
        if (!config.nc_token) {
            throw new Error('Required nc_token');
        }

        // const mobile = Browser.versions().mobile;
        const mobile = false;
        const scene = mobile ? 'nc_message_h5' : 'nc_message';

        let NC_Opt = {
            renderTo: '#sliderVerify',
            appkey: config.NC_Opt.appkey,
            scene,
            token: config.nc_token,
            trans: {},
            customWidth: '100%',
            elementID: ['usernameID'],
            is_Opt: 0,
            language: 'cn',
            isEnabled: true,
            timeout: 3000,
            times: 5,
            apimap: {
            },
        };

        const upLang: any = {
            lang: 'cn',
            obj: Browser.versions().mobile ? {
                LOADING: '加载中...', // 加载
                SLIDER_LABEL: '请向右滑动验证', // 等待滑动
                CHECK_Y: '验证通过', // 通过
                ERROR_TITLE: '非常抱歉，这出错了...', // 拦截
                CHECK_N: '验证未通过', // 准备唤醒二次验证
                OVERLAY_INFORM: '经检测你当前操作环境存在风险，请输入验证码', // 二次验证
                TIPS_TITLE: '验证码错误，请重新输入', // 验证码输错时的提示
            } : {
                    _startTEXT: '请向右滑动验证',
                    _yesTEXT: '验证通过',
                    _error300: '非常抱歉，这出错了...,请<a href="javascript:__nc.reset()">点击刷新</a>',
                    _errorNetwork: '网络不给力，请<a href="javascript:__nc.reset()">点击刷新</a>',
                },
        };

        if (config.upLang) {
            if (config.upLang.lang) {
                upLang.lang = config.upLang.lang;
            }
            if (config.upLang.obj) {
                upLang.obj = config.upLang.obj;
            }
        }

        let nc;
        if (mobile) {
            NC_Opt = _.assign({},
                NC_Opt,
                {
                    retryTimes: 5,
                    errorTimes: 5,
                    inline: false,
                    bannerHidden: false,
                    initHidden: false,
                },
                config.NC_Opt,
                {
                    callback: (data: any) => {
                        if (config.NC_Opt.callback) {
                            config.NC_Opt.callback(data, scene);
                        }
                    },
                },
            );

            nc = NoCaptcha.init(NC_Opt);

            NoCaptcha.setEnabled(true);

            nc.reset(); // 请务必确保这里调用一次reset()方法

            NoCaptcha.upLang(upLang.lang, upLang.obj);

        } else {
            NC_Opt = _.assign({},
                NC_Opt,
                config.NC_Opt,
                {
                    callback: (data: any) => {
                        if (config.NC_Opt.callback) {
                            config.NC_Opt.callback(data, scene);
                        }
                    },
                },
            );
            nc = new noCaptcha(NC_Opt);
            nc.upLang(upLang.lang, upLang.obj);
        }

        return nc;
    } catch (e) {
        console.error(e);
    }
};
