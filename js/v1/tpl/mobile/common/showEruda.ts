import { staticJsURL } from 'common/staticURL';

declare const window: Window;

// 点击9次
const CLICK_NUM = 20;
// 点击时间间隔5秒
const CLICK_INTERVER_TIME = 5000;
// 上一次的点击时间
let lastClickTime = 0;
// 记录点击次数
let clickNum = 0;

function erudaClick() {
    // 点击的间隔时间不能超过5秒
    const currentClickTime = new Date().getTime();
    if (currentClickTime - lastClickTime <= CLICK_INTERVER_TIME || lastClickTime === 0) {
        lastClickTime = currentClickTime;
        clickNum = clickNum + 1;
    } else {
        // 超过5秒的间隔
        // 重新计数 从1开始
        clickNum = 1;
        lastClickTime = 0;
        return;
    }
    if (clickNum === CLICK_NUM) {
        // 重新计数
        clickNum = 0;
        lastClickTime = 0;
        /*实现点击多次后的事件*/
        if ((window as any).eruda) {
            (window as any).eruda.init();
        } else {
            (() => {
                const hm: any = document.createElement('script');
                hm.src = staticJsURL('eruda.js');
                hm.crossorigin = 'anonymous';
                const s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(hm, s);
            })();
        }
    }
}

document.body.onclick = erudaClick;
