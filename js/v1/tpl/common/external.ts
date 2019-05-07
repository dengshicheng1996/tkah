const loadedCSS: { [url: string]: boolean } = {};
const loadedJS: { [url: string]: boolean } = {};

export function addCSS(url: string) {
    if (loadedCSS[url]) {
        return;
    }
    const link = document.createElement('link');
    link.href = url;
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.media = 'screen,print';
    document.getElementsByTagName('head')[0].appendChild(link);
    loadedCSS[url] = true;
}

export function addJS(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (loadedJS[url]) {
            resolve();
            return;
        }
        const link = document.createElement('script');
        link.onload = () => {
            resolve();
        };
        link.src = url;
        document.getElementsByTagName('head')[0].appendChild(link);
        loadedJS[url] = true;
    });
}
