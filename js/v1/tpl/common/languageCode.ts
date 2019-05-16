export const LanguageCode = (() => {
    const v = document.documentElement.lang;
    if (v === 'en-us' || v === 'en') {
        return 'en';
    }
    return 'cn';
})();

Object.defineProperty(exports, 'LanguageCode', {
    get: () => {
        const v = document.documentElement.lang;
        if (v === 'en-us' || v === 'en') {
            return 'en';
        }
        return 'cn';
    },
});
