declare let PRODUCTION: boolean;
declare let NGINX: boolean;

let STATIC_ROOT;
if (PRODUCTION || NGINX) {
    STATIC_ROOT = '/static';
} else {
    STATIC_ROOT = '';
}

export const staticImgURL = (img: string) => {
    return STATIC_ROOT + '/images/' + img;
};

export const staticJsURL = (js: string) => {
    return STATIC_ROOT + '/js/' + js;
};
