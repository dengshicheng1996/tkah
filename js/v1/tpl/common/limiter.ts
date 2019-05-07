// Limiter limits the number of concurrent promises that can be executed.
export class Limiter {
    private queue: Array<{
        resolve: (v: any) => void,
        reject: (err: any) => void,
        fn: () => Promise<any>,
    }> = [];
    private running = 0;

    constructor(public limit: number) { }
    public run = async<T> (fn: () => Promise<T>): Promise<T> => {
        if (this.limit <= 0) {
            return await fn();
        }
        if (!this.queue.length && this.limit > this.running) {
            return await this.runNow(fn);
        }
        return new Promise<T>((resolve, reject) => {
            this.queue.push({
                resolve,
                reject,
                fn,
            });
        });
    }

    private runNow = async (fn: () => Promise<any>) => {
        this.running++;
        try {
            return await fn();
        } finally {
            this.running--;
            this.runMore();
        }
    }

    private runMore = async () => {
        while (this.queue.length && this.limit > this.running) {
            const item = this.queue.shift();
            (async () => {
                try {
                    item.resolve(this.runNow(item.fn));
                } catch (err) {
                    item.reject(err);
                }
            })();
        }
    }
}
