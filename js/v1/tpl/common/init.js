if (process.env.NODE_ENV === 'production') {
    require('common/polyfill.js');
} else {
    require('common/error_display.exec.js');
}

window.paceOptions = {
    ajax: {
        // Do not track websocket since it could be long poll.
        trackWebSockets: false,
    },
    minTime: 0,
    ghostTime: 0,
};

require('pace-js/pace.js');
require('pace-js/themes/blue/pace-theme-minimal.css');
