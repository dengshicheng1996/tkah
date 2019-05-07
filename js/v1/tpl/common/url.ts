export function build(url: string, query: { [key: string]: any }) {
    if (!query) {
        return url;
    }
    const components = Object.keys(query).map(k => {
        const v = query[k];
        if (!v && !(typeof v === 'number' && v === 0)) {
            return;
        }
        return encodeURIComponent(k) + '=' + encodeURIComponent(v);
    }).filter(c => c);
    if (!components || components.length === 0) {
        return url;
    }
    return url + '?' + components.join('&');
}

export let buildURL = build;
