import { Browser } from 'common/sys';
declare const window: any;
declare const app: any;

export const appFn = {
    /**
     * 定位
     */
    getAppLocation: () => {
        try {
            if (Browser.versions().ios) {
                window.webkit.messageHandlers.uploadLocation.postMessage('uploadLocationResult');
            } else {
                app.getAppLocation && app.getAppLocation('uploadLocationResult');
            }
        } catch (e) {
            window.notieAlert('获取定位出现异常');
        }
    },
    /**
     * 停止定位
     */
    stopLocation: () => {
        try {
            if (Browser.versions().ios) {
                window.webkit.messageHandlers.stopLocation.postMessage('');
            } else {
                app.stopAppLocation && app.stopAppLocation();
            }
        } catch (e) {
            window.notieAlert('停止定位出现异常');
        }
    },
    /**
     * 通讯录
     */
    uploadContact: () => {
        try {
            if (Browser.versions().ios) {
                window.webkit.messageHandlers.uploadContact.postMessage('uploadContactResult');
            } else {
                app.getAppContact && app.getAppContact('uploadContactResult');
            }
        } catch (e) {
            window.notieAlert('上传通讯录出现异常');
        }
    },
    /**
     * 淘宝D
     */
    startSJMHTaobao: () => {
        try {
            if (Browser.versions().ios) {
                window.webkit.messageHandlers.startSJMHTaobao.postMessage('taobaoResult');
            } else {
                app.startSJMHTaobao && app.startSJMHTaobao('taobaoResult');
            }
        } catch (e) {
            window.notieAlert('调用淘宝出现异常');
        }
    },
    /**
     * face++
     */
    faceAuth: (json: any) => {
        try {
            if (Browser.versions().ios) {
                window.webkit.messageHandlers.faceAuth.postMessage(json);
            } else {
                app.startFaceAuth && app.startFaceAuth(JSON.stringify(json));
            }
        } catch (e) {
            window.notieAlert('face++出现异常');
        }
    },
    /**
     * 返回首页
     */
    popController: () => {
        try {
            if (Browser.versions().ios) {
                window.webkit.messageHandlers.popController.postMessage('');
            } else {
                app.popController();
            }
        } catch (e) {
            window.notieAlert('返回首页出现异常');
        }
    },
    /**
     * 关闭loading
     */
    stopLoading: () => {
        try {
            if (Browser.versions().ios) {
                window.webkit.messageHandlers.stopLoading.postMessage('');
            } else {
                app.stopLoading && app.stopLoading();
            }
        } catch (e) {
            window.notieAlert('停止loading出现异常');
        }
    },
    /**
     * 跳转loading
     */
    jumpToLogin: () => {
        try {
            if (Browser.versions().ios) {
                window.webkit.messageHandlers.jumpToLogin.postMessage('');
            } else {
                app.jumpToLogin && app.jumpToLogin();
            }
        } catch (e) {
            window.notieAlert('跳转登录出现异常');
        }
    },
    /**
     * 弹出通讯录权限
     */
    alertContractAuth: () => {
        try {
            if (Browser.versions().ios) {
                window.webkit.messageHandlers.setContactAuth.postMessage('');
            }
        } catch (e) {
            window.notieAlert('弹出通讯录异常');
        }
    },
    /**
     * 弹出定位权限
     */
    alertLocationAuth: () => {
        try {
            if (Browser.versions().ios) {
                window.webkit.messageHandlers.setLocationAuth.postMessage('');
            }
        } catch (e) {
            window.notieAlert('弹出定位异常');
        }
    },
    /**
     * 弹出相册权限
     */
    alertAuthPhoto: () => {
        try {
            if (Browser.versions().ios) {
                window.webkit.messageHandlers.setAuthPhoto.postMessage('');
            }
        } catch (e) {
            window.notieAlert('弹出相册异常');
        }
    },
};
// 获取版本
const AppVersion = (version: { ios: number, android: number }) => {
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
                    // ios：2.9.0及以上版本会弹出框，android不会调用
                    if (AppVersion({ ios: 290, android: 2000 })) {
                        appFn.alertLocationAuth();
                        reject('');
                    } else {
                        reject('定位权限异常');
                    }
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
                    // ios：2.9.0及以上版本会弹出框，android不会调用
                    if (AppVersion({ ios: 290, android: 2000 })) {
                        appFn.alertContractAuth();
                        reject('');
                    } else {
                        reject('通讯录权限异常');
                    }
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
                    // ios：2.9.0及以上版本会弹出框，android不会调用
                    if (AppVersion({ ios: 290, android: 2000 })) {
                        appFn.alertAuthPhoto();
                        reject('');
                    } else {
                        reject('没有相机权限失败');
                    }
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
export const NavBarBack = (fn: () => void) => {
    window.navbar.back = () => {
        fn();
    };
};

// 设置Title
export const NavBarTitle = (title: string) => {
    window.navbar.title = title;
};
