import { NewSpec } from './fuselib';

const spec = NewSpec();

spec.AddSPA('mobile/app/httpStatus');
spec.AddSPA('mobile/app/promotion');
spec.AddSPA('mobile/app/apply');
spec.AddSPA('mobile/app/bill');
spec.AddSPA('mobile/app/withdraw');
spec.AddSPA('management');
spec.AddSPA('operatePlat');

spec.Run();
