declare let window: any;
declare let navigator: any;

export const DetectOS = {
    versions: () => {
        const sUserAgent = navigator.userAgent;
        const platform = navigator.platform;
        const win = (platform === 'Win32') || (platform === 'Windows');
        const mac = (platform === 'Mac68K') || (platform === 'MacPPC') || (platform === 'Macintosh') || (platform === 'MacIntel');
        const unix = (platform === 'X11') && !win && !mac;
        const linux = (String(platform).indexOf('Linux') > -1);
        let cpuClass;
        let isWin2000 = false;
        let isWinXP = false;
        let isWin2003 = false;
        let isWinVista = false;
        let isWin7 = false;

        if (win) {
            cpuClass = sUserAgent.match(/x86_64|Win64|WOW64/) || navigator['cpuClass'] === 'x64' ? '64' : '32';
            isWin2000 = sUserAgent.indexOf('Windows NT 5.0') > -1 || sUserAgent.indexOf('Windows 2000') > -1;
            isWinXP = sUserAgent.indexOf('Windows NT 5.1') > -1 || sUserAgent.indexOf('Windows XP') > -1;
            isWin2003 = sUserAgent.indexOf('Windows NT 5.2') > -1 || sUserAgent.indexOf('Windows 2003') > -1;
            isWinVista = sUserAgent.indexOf('Windows NT 6.0') > -1 || sUserAgent.indexOf('Windows Vista') > -1;
            isWin7 = sUserAgent.indexOf('Windows NT 6.1') > -1 || sUserAgent.indexOf('Windows 7') > -1;
        }

        return {
            mac,
            unix,
            linux,
            win,
            win_v: {
                cpuClass,
                isWin2000: win && isWin2000,
                isWinXP: win && isWinXP,
                isWin2003: win && isWin2003,
                isWinVista: win && isWinVista,
                isWin7: win && isWin7,
            },
            other: !mac && !unix && !linux && win,
        };
    },
};

export const Browser = {
    versions: () => {
        const u = navigator.userAgent;
        return {         // 移动终端浏览器版本信息
            mobileVersion: u.match(/rxzny_\d+(\.\d+)*_version/), // 账单管家版本号
            rxzny: u.indexOf('rxzny') > -1, // 账单管家
            trident: u.indexOf('Trident') > -1, // IE内核
            presto: u.indexOf('Presto') > -1, // opera内核
            webKit: u.indexOf('AppleWebKit') > -1, // 苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') === -1, // 火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), // 是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios终端
            android: u.indexOf('Android') > -1, // android终端
            iPhone: u.indexOf('iPhone') > -1, // 是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, // 是否iPad
            webApp: u.indexOf('Safari') === -1, // 是否web应该程序，没有头部与底部
            wechat: /MicroMessenger/i.test(u), // 是否是微信浏览器
            explore: {
                uc: u.indexOf('Linux') > -1, // uc浏览器
                ie: u.indexOf('compatible') > -1 && u.indexOf('MSIE') > -1, // ie 浏览器
                ie11: !!window['ActiveXObject'] || 'ActiveXObject' in window, // ie >= 11 浏览器
                edge: u.indexOf('Edge') > -1, // edge 浏览器
                safari: u.indexOf('Safari') > -1 && u.indexOf('Chrome') === -1, // safari 浏览器
                chrome: u.indexOf('Chrome') > -1 && u.indexOf('Safari') > -1, // chrome 浏览器
                firefox: u.indexOf('Firefox') > -1, // 火狐浏览器
                opera: u.indexOf('Opera') > -1 || u.indexOf('OPR') > -1, // Opera 浏览器
            },
        };
    },
};
