function getPath<T>(obj: T): T;
function getPath<T, K1 extends keyof T>(obj: T, key1: K1): T[K1] | undefined;
function getPath<T,
    K1 extends keyof T,
    K2 extends keyof T[K1]>(
        obj: T, key1: K1, key2: K2): T[K1][K2] | undefined;
function getPath<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]>(
        obj: T, key1: K1, key2: K2, key3: K3): T[K1][K2][K3] | undefined;
function getPath<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3]>(
        obj: T, key1: K1, key2: K2, key3: K3, key4: K4): T[K1][K2][K3][K4] | undefined;
function getPath<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4]>(
        obj: T, key1: K1, key2: K2, key3: K3, key4: K4, key5: K5): T[K1][K2][K3][K4][K5] | undefined;
function getPath<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5]>(
        obj: T, key1: K1, key2: K2, key3: K3, key4: K4, key5: K5, key6: K6): T[K1][K2][K3][K4][K5][K6] | undefined;
function getPath<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5],
    K7 extends keyof T[K1][K2][K3][K4][K5][K6]>(
        obj: T, key1: K1, key2: K2, key3: K3, key4: K4, key5: K5, key6: K6, key7: K7): T[K1][K2][K3][K4][K5][K6][K7] | undefined;
function getPath<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5],
    K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7]>(
        obj: T, key1: K1, key2: K2, key3: K3, key4: K4, key5: K5, key6: K6, key7: K7, key8: K8): T[K1][K2][K3][K4][K5][K6][K7][K8] | undefined;
function getPath<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5],
    K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7],
    K9 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8]>(
        obj: T, key1: K1, key2: K2, key3: K3, key4: K4, key5: K5, key6: K6, key7: K7, key8: K8, key9: K9): T[K1][K2][K3][K4][K5][K6][K7][K8][K9] | undefined;
function getPath<T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5],
    K7 extends keyof T[K1][K2][K3][K4][K5][K6],
    K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7],
    K9 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8],
    K10 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8][K9]>(
        obj: T, key1: K1, key2: K2, key3: K3, key4: K4, key5: K5, key6: K6, key7: K7, key8: K8, key9: K9, key10: K10): T[K1][K2][K3][K4][K5][K6][K7][K8][K9][K10] | undefined;
function getPath(obj: any, ...keys: any[]) {
    let r = obj;

    for (const key of keys) {
        if (!r) {
            return undefined;
        }
        r = r[key];
    }

    return r;
}

export const GetPath = getPath;

type Caller<T> = () => T | undefined;
export type OCType<T> = {
    <K1 extends keyof T>(
        key1: K1): T[K1];
    <K1 extends keyof T,
        K2 extends keyof T[K1]>(
        key1: K1, key2: K2): T[K1][K2];
    <K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2]>(
        key1: K1, key2: K2, key3: K3): T[K1][K2][K3];
    <K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3]>(
        key1: K1, key2: K2, key3: K3, key4: K4): T[K1][K2][K3][K4];
    <K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4]>(
        key1: K1, key2: K2, key3: K3, key4: K4, key5: K5): T[K1][K2][K3][K4][K5];
    <K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5]>(
        key1: K1, key2: K2, key3: K3, key4: K4, key5: K5, key6: K6): T[K1][K2][K3][K4][K5][K6];
    <K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6]>(
        key1: K1, key2: K2, key3: K3, key4: K4, key5: K5, key6: K6, key7: K7): T[K1][K2][K3][K4][K5][K6][K7];
    <K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
        K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7]>(
        key1: K1, key2: K2, key3: K3, key4: K4, key5: K5, key6: K6, key7: K7, key8: K8): T[K1][K2][K3][K4][K5][K6][K7][K8];
    <K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
        K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7],
        K9 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8]>(
        key1: K1, key2: K2, key3: K3, key4: K4, key5: K5, key6: K6, key7: K7, key8: K8, key9: K9): T[K1][K2][K3][K4][K5][K6][K7][K8][K9];
    <K1 extends keyof T,
        K2 extends keyof T[K1],
        K3 extends keyof T[K1][K2],
        K4 extends keyof T[K1][K2][K3],
        K5 extends keyof T[K1][K2][K3][K4],
        K6 extends keyof T[K1][K2][K3][K4][K5],
        K7 extends keyof T[K1][K2][K3][K4][K5][K6],
        K8 extends keyof T[K1][K2][K3][K4][K5][K6][K7],
        K9 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8],
        K10 extends keyof T[K1][K2][K3][K4][K5][K6][K7][K8][K9]>(
        key1: K1, key2: K2, key3: K3, key4: K4, key5: K5, key6: K6, key7: K7, key8: K8, key9: K9, key10: K10): T[K1][K2][K3][K4][K5][K6][K7][K8][K9][K10];
} & Caller<T>;

export function oc<T>(v: T): OCType<T> {
    function g(...keys: any[]) {
        let r = v as any;

        for (const key of keys) {
            if (!r) {
                return undefined;
            }
            r = r[key];
        }

        return r;
    }
    return g;
}
