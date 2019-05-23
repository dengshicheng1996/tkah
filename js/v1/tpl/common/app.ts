import { Browser } from 'common/sys';

declare const window: any;
declare const app: any;

export const appFn = {
    /**
     * 定位
     */
    getAppLocation: () => {
        if (Browser.versions().ios) {
            window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.uploadLocation &&
                window.webkit.messageHandlers.uploadLocation.postMessage && window.webkit.messageHandlers.uploadLocation.postMessage('uploadLocationResult');
        } else if (Browser.versions().android) {
            app.getAppLocation && app.getAppLocation('uploadLocationResult');
        }
    },
    /**
     * 停止定位
     */
    stopLocation: () => {
        if (Browser.versions().ios) {
            window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.stopLocation &&
                window.webkit.messageHandlers.stopLocation.postMessage && window.webkit.messageHandlers.stopLocation.postMessage('');
        } else if (Browser.versions().android) {
            app.stopAppLocation && app.stopAppLocation();
        }
    },
    /**
     * 通讯录
     */
    uploadContact: () => {
        if (Browser.versions().ios) {
            window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.uploadContact &&
                window.webkit.messageHandlers.uploadContact.postMessage && window.webkit.messageHandlers.uploadContact.postMessage('uploadContactResult');
        } else if (Browser.versions().android) {
            app.getAppContact && app.getAppContact('uploadContactResult');
        }
    },
    /**
     * 淘宝D
     */
    startSJMHTaobao: () => {
        if (Browser.versions().ios) {
            window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.startSJMHTaobao &&
                window.webkit.messageHandlers.startSJMHTaobao.postMessage && window.webkit.messageHandlers.startSJMHTaobao.postMessage('taobaoResult');
        } else if (Browser.versions().android) {
            app.startSJMHTaobao && app.startSJMHTaobao('taobaoResult');
        }
    },
    /**
     * face++
     */
    faceAuth: (json: any) => {
        if (Browser.versions().ios) {
            window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.faceAuth &&
                window.webkit.messageHandlers.faceAuth.postMessage && window.webkit.messageHandlers.faceAuth.postMessage(json);
        } else if (Browser.versions().android) {
            app.startFaceAuth && app.startFaceAuth(JSON.stringify(json));
        }
    },
    /**
     * 返回首页
     */
    popController: () => {
        if (Browser.versions().ios) {
            window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.popController &&
                window.webkit.messageHandlers.popController.postMessage && window.webkit.messageHandlers.popController.postMessage('');
        } else if (Browser.versions().android) {
            app.popController();
        }
    },
    /**
     * 关闭loading
     */
    stopLoading: () => {
        if (Browser.versions().ios) {
            window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.stopLoading &&
                window.webkit.messageHandlers.stopLoading.postMessage && window.webkit.messageHandlers.stopLoading.postMessage('');
        } else if (Browser.versions().android) {
            app.stopLoading && app.stopLoading();
        }
    },
    /**
     * 跳转login
     */
    jumpToLogin: () => {
        if (Browser.versions().ios) {
            window.webkit &&
                window.webkit.messageHandlers &&
                window.webkit.messageHandlers.jumpToLogin &&
                window.webkit.messageHandlers.jumpToLogin.postMessage && window.webkit.messageHandlers.jumpToLogin.postMessage('');
        } else if (Browser.versions().android) {
            app.jumpToLogin && app.jumpToLogin();
        }
    },
};

/**
 * 定位
 */
export const getAppLocation = () => {
    return new Promise((resolve, reject) => {
        appFn.getAppLocation();
        if (!window.webJS) {
            window.webJS = {};
        }
        window.webJS.uploadLocationResult = (result: any) => {
            appFn.stopLocation();
            if (result.status === 0) {
                if (result.code === 1000) {
                    reject('定位权限异常');
                } else if (result.code === 1001) {
                    reject('定位获取失败');
                }
                reject('手机定位异常');
                return;
            }
            resolve(result);
        };
    });
};

/**
 * 通讯录
 */
export const uploadContact = () => {
    return new Promise((resolve, reject) => {
        appFn.uploadContact();
        if (!window.webJS) {
            window.webJS = {};
        }
        window.webJS.uploadContactResult = (result: any) => {
            if (result.status === 0) {
                if (result.code === 1000) {
                    reject('通讯录权限异常');
                } else if (result.code === 1001) {
                    reject('通讯录获取失败');
                }
                reject('手机通讯录异常');
                return;
            }
            resolve(result);
        };
    });
};

/**
 * 淘宝D
 */
export const startSJMHTaobao = () => {
    return new Promise((resolve, reject) => {
        appFn.startSJMHTaobao();
        if (!window.webJS) {
            window.webJS = {};
        }
        window.webJS.taobaoResult = (result: any) => {
            if (result.status === 0) {
                if (result.code === 1000) {
                    reject('淘宝D授权失败，请重新授权');
                }
                reject('手机淘宝D异常');
                return;
            }
            resolve(result);
        };
    });
};

/**
 * face++
 */
export const faceAuth = (json: any) => {
    return new Promise((resolve, reject) => {
        const data = Object.assign({}, json, { method: 'faceAuthResult' });
        appFn.faceAuth(data);
        if (!window.webJS) {
            window.webJS = {};
        }
        window.webJS.faceAuthResult = (result: any) => {
            if (result.status === 0) {
                if (result.code === 1000) {
                    reject('face++初始化失败');
                } else if (result.code === 1001) {
                    reject('没有相机权限失败');
                } else if (result.code === 1002) {
                    reject('face++验证失败');
                }
                reject('验证失败，请确保光线充足，摘下眼睛，动作正确');
                return;
            }
            resolve(result);
        };
    });
};

// 设置返回事件
export const NavBarBack = (fn?: () => void) => {
    window.navbar.back = () => {
        fn ? fn() : window.history.back();
    };
};

// 设置Title
export const NavBarTitle = (title?: string) => {
    window.navbar.title = title || '填写资料';
};

export const IsAppPlatform = () => {
    return Browser.versions().rxzny;
};

export const AppVersion = (version: { ios: number, android: number }) => {
    const browser = Browser.versions();
    const v = (browser.mobileVersion ? browser.mobileVersion[0].split('_')[1] : '0.0.0').split('.');
    const vn = v[0] * 100 + v[1] * 10 + v[2] * 1;
    if (!vn) {
        return false;
    }
    let newLogic = false;
    if (browser.ios) {
        newLogic = vn >= version.ios;
    } else {
        newLogic = vn >= version.android;
    }

    return newLogic;
};
