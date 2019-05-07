// 解析后端抛回的errors

declare let PRODUCTION: boolean;

interface Result {
    errors: Array<{
        locations: string[];
        message: string;
    }> | any;
}

const kinds = [
    'Internal',
    'NotFound',
    'Forbidden',
    'Unauthenticated',
    'InvalidArgument',
    'Conflict',
    'TryAgain',
];

interface A2Error {
    // 增加Unknown，如果不匹配的error就是Unknown
    kind: 'Internal' | 'NotFound' | 'Forbidden' | 'Unauthenticated' | 'InvalidArgument' | 'Conflict' | 'TryAgain' | 'Unknown';
    subKind: string;
    humanFriendlyMessage: string;
}

const prodErrMsgPattern = `^(${kinds.join('|')}) error: (([a-z_]+:[0-9a-z_]+) subkind: )?(.*)`;
const devErrMsgPattern = `^(${kinds.join('|')}) error: (([a-z_]+:[0-9a-z_]+) subkind: )?([\\S\\s]*)`;
function unknownError(msg: any): A2Error {
    return {
        kind: 'Unknown',
        subKind: null,
        humanFriendlyMessage: PRODUCTION ? 'Unknown error' : msg,
    };
}
function tryToUnwrap(errMsg: string): A2Error {
    const vs = new RegExp(PRODUCTION ? prodErrMsgPattern : devErrMsgPattern).exec(errMsg);
    if (!vs) {
        return unknownError(errMsg);
    }
    return {
        kind: vs[1] as any,
        subKind: vs[3],
        humanFriendlyMessage: vs[4],
    };
}

function fromResult(r: Result): A2Error {
    if (!r.errors || !r.errors.length || !r.errors[0].message) {
        return unknownError(r);
    }
    return tryToUnwrap(r.errors[0].message);
}

export {
    tryToUnwrap,
    fromResult,
};
