// import * as _ from 'lodash';

// // 时间转换接口
// export const transfromTime = (timeStamp?, hasHour?, hasSec?, params?) => {
//     if (!timeStamp) {
//         return '';
//     }
//     const date = new Date(timeStamp * 1000);
//     const y = date.getFullYear();
//     let m: any = date.getMonth() + 1;
//     let d: any = date.getDate();
//     let h: any = date.getHours();
//     let min: any = date.getMinutes();
//     let sec: any = date.getSeconds();
//     const join = (params && params.join) || '-';
//
//     if (isNaN(y) || isNaN(m) || isNaN(d)) {
//         return '';
//     } else {
//         if (m < 10) {
//             m = '0' + m;
//         }
//         if (d < 10) {
//             d = '0' + d;
//         }
//         if (h < 10) {
//             h = '0' + h;
//         }
//         if (min < 10) {
//             min = '0' + min;
//         }
//         if (sec < 10) {
//             sec = '0' + sec;
//         }
//         if (hasHour === false) {
//             return y + join + m + join + d;
//         }
//         if (hasSec === false) {
//             return y + join + m + join + d + ' ' + h + ':' + min;
//         }
//
//         return y + join + m + join + d + ' ' + h + ':' + min + ':' + sec;
//     }
// };
//
// /**
//  * @param str [解析字符转]
//  * @param originalValue 【options】,初始值
//  */
// export const parseJSON = (str, originalValue?) => {
//     let value;
//     try {
//         value = JSON.parse(str);
//     } catch (err) {
//         // 解析json字符发生错误的时候处理成空字符
//         if (originalValue) {
//             value = originalValue;
//         } else {
//             value = [];
//         }
//
//     }
//     return value;
// };
//
// /**
//  * 两对象数组根据ID做差，返回差值数组(带数组去重 By idName)
//  * @param arrA ：总数组
//  * @param arrB ：做差数组
//  * @param idName ：id参数
//  */
// export const differenceArr = (arrA?, arrB?, idName?) => {
//     // 获取做差数组arrB的id数组
//     const arrBIds = [];
//     _.forEach(arrB, (item) => {
//         const itemId = parseInt(item[idName]);
//
//         if (_.indexOf(arrBIds, itemId) === -1) {
//             arrBIds.push(itemId);
//         }
//     });
//
//     const resultArr = [];
//     const arrAIds = [];
//     _.forEach(arrA, (item) => {
//         const itemId = parseInt(item[idName]);
//
//         if (_.indexOf(arrAIds, itemId) === -1) {
//             arrAIds.push(itemId);
//             if (_.indexOf(arrBIds, itemId) === -1) {
//                 resultArr.push(item);
//             }
//         }
//     });
//
//     return resultArr;
// };
/**
 * 配置分隔符
 */
export const getSeparator = () => {
    return '_YLXD_';
};
