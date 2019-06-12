declare let PRODUCTION: boolean;
declare let NGINX: boolean;

let STATIC_ROOT;
if (PRODUCTION || NGINX) {
    STATIC_ROOT = '/static';
} else {
    STATIC_ROOT = '';
}
const STATIC_BASE_URL = STATIC_ROOT + '/images/';

export const staticBaseURL = (img: string) => {
    return STATIC_BASE_URL + img;
};
