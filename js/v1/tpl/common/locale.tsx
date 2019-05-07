import { LanguageCode } from 'common/languageCode';

const en = {
};

const cn: typeof en = {
};

export const S: typeof en = (() => {
    if (LanguageCode === 'en') {
        return en;
    }
    return cn;
})();

Object.defineProperty(exports, 'S', {
    get: () => {
        if (LanguageCode === 'en') {
            return en;
        }
        return cn;
    },
});
