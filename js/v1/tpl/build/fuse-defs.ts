import { NewSpec } from './fuselib';

const spec = NewSpec();

spec.AddSPA('promotion', { dir: 'mobile/app/promotion' });
spec.AddSPA('apply', { dir: 'mobile/app/apply' });
spec.AddSPA('bill', { dir: 'mobile/app/bill' });
spec.AddSPA('management');
spec.AddSPA('operatePlat');

spec.Run();
