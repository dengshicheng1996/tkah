import { exec } from 'child_process';
import { runInParallel } from './parallel';

exec('node ./tpl/build/fuse.js ".*" --list', (err, stdout, stderr) => {
    if (err) {
        console.log(err);
        process.exit(1);
        return;
    }
    const prjs = stdout.split('\n');
    runInParallel(prjs.filter(prj => !!prj).map((prj, i) => {
        const commonCheck = '--no_strict_common_check';
        // const commonCheck = i === 0 ? '' : '--no_strict_common_check';
        return `node ./tpl/build/fuse.js ${prj} --production ${commonCheck}`;
    })).catch(err2 => {
        console.log(err2);
        process.exit(1);
        return;
    });
});
