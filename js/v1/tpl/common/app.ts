import { Browser } from 'common/sys';

declare const window: any;
declare const app: any;

const run = (funcN: string, arg?: any) => {
    if (Browser.versions().ios) {
        if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers[funcN]
        ) {
            window.webkit.messageHandlers[funcN].postMessage(arg);

        }
    } else if (Browser.versions().android) {
        if (app[funcN]) {
            arg ? app[funcN](arg) : app[funcN]();
        }
    }
};

export const AppFn = {
    /**
     * 定位
     */
    getAppLocation: () => {
        console.log('getAppLocation');
        if (Browser.versions().ios) {
            run('uploadLocation', 'uploadLocationResult');
        } else if (Browser.versions().android) {
            run('getAppLocation', 'uploadLocationResult');
        }
    },
    /**
     * 停止定位
     */
    stopLocation: () => {
        console.log('stopLocation');
        if (Browser.versions().ios) {
            run('stopLocation', '');
        } else if (Browser.versions().android) {
            run('stopAppLocation', '');
        }
    },
    /**
     * 通讯录
     */
    uploadContact: () => {
        console.log('uploadContact');
        if (Browser.versions().ios) {
            run('uploadContact', 'uploadContactResult');
        } else if (Browser.versions().android) {
            run('getAppContact', 'uploadContactResult');
        }
    },
    /**
     * 淘宝D
     */
    startSJMHTaobao: () => {
        console.log('startSJMHTaobao');
        if (Browser.versions().ios) {
            run('startSJMHTaobao', 'taobaoResult');
        } else if (Browser.versions().android) {
            run('startSJMHTaobao', 'taobaoResult');
        }
    },
    /**
     * face++
     */
    faceAuth: (json: any) => {
        console.log('faceAuth');
        if (Browser.versions().ios) {
            run('faceAuth', json);
        } else if (Browser.versions().android) {
            app.startFaceAuth && app.startFaceAuth(JSON.stringify(json));
        }
    },
    /**
     * 关闭loading
     */
    stopLoading: () => {
        console.log('stopLoading');
        if (Browser.versions().ios) {
            run('stopLoading', '');
        } else if (Browser.versions().android) {
            run('stopLoading');
        }
    },
    /**
     * 跳转login
     */
    jumpToLogin: () => {
        console.log('jumpToLogin');
        if (Browser.versions().ios) {
            run('jumpToLogin', '');
        } else if (Browser.versions().android) {
            run('jumpToLogin');
        }
    },
    /**
     * 设置头部基本配置
     */
    setConfig: (json: any) => {
        console.log('setConfig');
        if (Browser.versions().ios) {
            run('webNav', json);
        } else if (Browser.versions().android) {
            run('webNav', JSON.stringify(json));
        }
    },
    /**
     * 后退
     */
    actionBack: () => {
        console.log('actionBack');
        if (Browser.versions().ios) {
            run('actionBack', '');
        } else if (Browser.versions().android) {
            run('actionBack');
        }
    },
    /**
     * 重新加载
     */
    actionReload: () => {
        console.log('actionReload');
        if (Browser.versions().ios) {
            run('actionReload', '');
        } else if (Browser.versions().android) {
            run('actionReload');
        }
    },
    /**
     * 咨询
     */
    actionAsk: () => {
        console.log('actionAsk');
        if (Browser.versions().ios) {
            run('actionAsk', '');
        } else if (Browser.versions().android) {
            run('actionAsk');
        }
    },
    /**
     * 回到首页
     */
    actionFinish: () => {
        console.log('actionFinish');
        if (Browser.versions().ios) {
            run('actionFinish', '');
        } else if (Browser.versions().android) {
            run('actionFinish');
        }
    },
    /**
     * 设置title
     */
    setTitleLabel: (title: string) => {
        console.log('setTitleLabel');
        if (Browser.versions().ios) {
            run('setTitleLabel', title);
        } else if (Browser.versions().android) {
            run('setTitleLabel', title);
        }
    },
    /**
     * OCR
     */
    faceOCR: (json: any) => {
        console.log('faceOCR');
        if (Browser.versions().ios) {
            run('faceOCR', json);
        } else if (Browser.versions().android) {
            run('faceOCR', JSON.stringify(json));
        }
    },
    /**
     * 授权页
     */
    showNewSettingView: (json: any) => {
        console.log('showNewSettingView');
        if (Browser.versions().ios) {
            run('showNewSettingView', json);
        } else if (Browser.versions().android) {
            run('showNewSettingView', JSON.stringify(json));
        }
    },
    /**
     * 相机授权
     */
    setAuthPhoto: () => {
        console.log('setAuthPhoto');
        if (Browser.versions().ios) {
            run('setAuthPhoto', '');
        } else if (Browser.versions().android) {
            run('setAuthPhoto', '');
        }
    },
    /**
     * 返回进件页
     */
    backWebHome: () => {
        console.log('backWebHome');
        if (Browser.versions().ios) {
            run('backWebHome', '');
        } else if (Browser.versions().android) {
            run('backWebHome', '');
        }
    },
    /**
     * 选择通讯录
     */
    contactPicker: () => {
        console.log('contactPicker');
        if (Browser.versions().ios) {
            run('contactPicker', 'contactPickerResult');
        } else if (Browser.versions().android) {
            run('contactPicker', 'contactPickerResult');
        }
    },
};

/**
 * 选择通讯录
 */
export const ContactPicker = (fn?: () => void) => {
    return new Promise((resolve, reject) => {
        AppFn.contactPicker();
        if (!window.webJS) {
            window.webJS = {};
        }
        window.webJS.contactPickerResult = (result: any) => {
            if (result.status === 0) {
                if (result.code === 1000) {
                    fn && fn();
                    reject('通讯录权限被拒');
                } else if (result.code === 1001) {
                    reject('用户取消选择');
                }
                reject('手机定位异常');
                return;
            }
            resolve(result);
        };
    });
};

/**
 * 授权页
 */
export const ShowNewSettingView = (json: any) => {
    return new Promise((resolve, reject) => {
        const data = Object.assign({}, json, { method: 'showNewSettingViewResult' });
        AppFn.showNewSettingView(data);
        if (!window.webJS) {
            window.webJS = {};
        }
        window.webJS.showNewSettingViewResult = (result: any) => {
            resolve(result);
        };
    });
};

/**
 * faceOCR
 */
export const FaceOCR = (json: any, fn?: () => void) => {
    return new Promise((resolve, reject) => {
        const data = Object.assign({}, json, { method: 'faceOCRResult' });
        AppFn.faceOCR(data);
        if (!window.webJS) {
            window.webJS = {};
        }
        window.webJS.faceOCRResult = (result: any) => {
            if (result.status === 0) {
                if (result.code === 1000) {
                    reject('face++OCR初始化失败');
                } else if (result.code === 1001) {
                    fn && fn();
                    reject();
                } else if (result.code === 1002) {
                    reject('身份证图片识别失败');
                } else if (result.code === 1003) {
                    reject('身份证拍照成功，数据上传失败');
                }
                reject('face++OCR异常');
                return;
            }
            resolve(result);
        };
    });
};

/**
 * 定位
 */
export const GetAppLocation = () => {
    return new Promise((resolve, reject) => {
        AppFn.getAppLocation();
        if (!window.webJS) {
            window.webJS = {};
        }
        window.webJS.uploadLocationResult = (result: any) => {
            AppFn.stopLocation();
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
export const UploadContact = (fn?: () => void) => {
    return new Promise((resolve, reject) => {
        AppFn.uploadContact();
        if (!window.webJS) {
            window.webJS = {};
        }
        window.webJS.uploadContactResult = (result: any) => {
            if (result.status === 0) {
                if (result.code === 1000) {
                    fn && fn();
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
        AppFn.startSJMHTaobao();
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
export const FaceAuth = (json: any, fn?: () => void) => {
    return new Promise((resolve, reject) => {
        const data = Object.assign({}, json, { method: 'faceAuthResult' });
        AppFn.faceAuth(data);
        if (!window.webJS) {
            window.webJS = {};
        }
        window.webJS.faceAuthResult = (result: any) => {
            if (result.status === 0) {
                if (result.code === 1000) {
                    reject('face++初始化失败');
                } else if (result.code === 1001) {
                    fn && fn();
                    reject();
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

// 初始化按钮
export const InitBtn = () => {
    if (!window.webJS) {
        window.webJS = {};
    }

    window.webJS.backDic = () => {
        window.history.back();
    };
    window.webJS.closeDic = () => {
        AppFn.actionFinish();
    };
    window.webJS.finishDic = () => {
        AppFn.actionAsk();
    };
};

// 设置返回事件
export const NavBarBack = (fn?: () => void) => {
    if (IsAppPlatform()) {
        window.webJS.backDic = () => {
            console.log('backDic');
            fn ? fn() : window.history.back();
        };
    } else {
        window.navbar.back = () => {
            fn ? fn() : window.history.back();
        };
    }
};

// 设置关闭事件
export const NavBarClose = (fn?: () => void) => {
    if (IsAppPlatform()) {
        window.webJS.closeDic = () => {
            console.log('closeDic');
            fn ? fn() : AppFn.backWebHome();
        };
    } else {
        window.navbar.back = () => {
            fn ? fn() : window.history.back();
        };
    }
};

// 设置联系客服/完成按钮
export const NavBarFinish = (fn?: () => void) => {
    if (IsAppPlatform()) {
        window.webJS.finishDic = () => {
            console.log('finishDic');
            fn ? fn() : AppFn.actionAsk();
        };
    } else {
        window.navbar.back = () => {
            fn ? fn() : window.history.back();
        };
    }
};

// 设置Title
export const NavBarTitle = (title: string, setTitle?: () => void) => {
    if (IsAppPlatform()) {
        AppFn.setTitleLabel(title);
    } else {
        setTitle && setTitle();
    }
};

// 是否是账单管家
export const IsAppPlatform = () => {
    return Browser.versions().rxzny;
};

// 判断版本号
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
