import C from 'antd/lib/locale-provider';
import 'antd/lib/locale-provider/style/css';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import 'common/antd/default-style.css';
import 'moment/locale/zh-cn';
export const LocaleProvider: typeof C = require('antd/lib/locale-provider');
export const zhCNC: typeof zhCN = zhCN;
