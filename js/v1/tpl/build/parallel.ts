import { spawn } from 'child_process';
import { WritableStream } from 'htmlparser2';
import * as os from 'os';
import { Readable } from 'stream';
import { Limiter } from '../common/limiter';
import { hrtimeToSeconds } from './utils';

export async function runInParallel(commands: string[]): Promise<void> {
    const par = os.cpus().length;
    const ctrlStartTime = process.hrtime();
    console.log('[control][  info]', `Parallalism: ${par}. ${commands.length} tasks to run.`);
    const limit = new Limiter(par);
    return Promise.all(commands.map((cmd, i) => {
        return limit.run(() => {
            return new Promise((resolve, reject) => {
                const startTime = process.hrtime();

                const proc = spawn('sh', ['-c', cmd]);
                console.log(`[${i}\t][  info]`, `Command: ${cmd}`);
                const stdoutWriter = createLineWriter(`[${i}\t][stdout] `, process.stdout);
                const stderrWriter = createLineWriter(`[${i}\t][stderr] `, process.stderr);

                proc.stdout.on('data', stdoutWriter.bufCallback);
                proc.stderr.on('data', stderrWriter.bufCallback);
                proc.on('close', (code) => {
                    stdoutWriter.done();
                    stderrWriter.done();

                    const elapsedSeconds = hrtimeToSeconds(process.hrtime(startTime));

                    console.log(`[${i}\t][  info]`, `Exit with code: ${code}. Elapsed: ${elapsedSeconds}s.`);
                    if (code > 0) {
                        reject(new Error(`process exit with code ${code}`));
                        return;
                    }
                    resolve();
                });
            });
        });
    })).then(() => {
        const elapsedSeconds = hrtimeToSeconds(process.hrtime(ctrlStartTime));
        console.log('[control][  info]', `All done, elapsed: ${elapsedSeconds}s.`);
        return;
    });

    function createLineWriter(prefix: string, writer: NodeJS.WritableStream) {
        let lastLine = '';
        const writeln = (c) => {
            writer.write(`${prefix}${c}\n`);
        };
        return {
            bufCallback: (buf: Readable) => {
                const lines = buf.toString().split(/(\n)/g);
                if (lines.length === 1) {
                    lastLine = lines[0];
                    return;
                }
                writeln(`${lastLine}${lines[0]}`);
                lines.forEach((l, i) => {
                    if (i === 0 || i % 2 === 1) {
                        return;
                    }
                    if (i === lines.length - 1) {
                        lastLine = l;
                        return;
                    }
                    writeln(l);
                });
            },
            done: () => {
                if (lastLine !== '') {
                    writeln(lastLine);
                }
            },
        };
    }
}
