import { NewSpec } from './fuselib';

const spec = NewSpec();

spec.AddSPA('mobile/app/httpStatus404', { title: '找不到页面' });
spec.AddSPA('mobile/app/httpStatus500', { title: '服务器错误' });
spec.AddSPA('mobile/app/promotion', { title: '产品推广' });
spec.AddSPA('mobile/app/apply', { title: '填写资料' });
spec.AddSPA('mobile/app/bill', { title: '账单' });
spec.AddSPA('mobile/app/withdraw', { title: '提现' });
spec.AddSPA('management', { title: '阿尔法象后台' });
spec.AddSPA('operatePlat', { title: '运营平台' });
spec.AddSPA('statistics', { title: '数据统计' });

spec.Run();
