import { NewSpec } from './fuselib';

const spec = NewSpec();

spec.AddSPA('apply');
spec.AddSPA('bill');
spec.AddSPA('management');

spec.Run();
