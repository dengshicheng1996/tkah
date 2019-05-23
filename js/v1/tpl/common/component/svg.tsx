import * as React from 'react';

export const EditSvg = (props: any) => (
    <svg viewBox='0 0 1024 1024' width='42' height='42'>
        <path d='M689.59393838 258.75109776c-16.43231641-17.37367418-43.18108399-17.37367418-59.61044036 0L596.18934869
         294.66478173l79.45295768 84.21895134 33.79710992-35.90184323c16.61289129-17.38255487 16.61289129-45.63808691
         0-63.02360184l-19.84547791-21.20719024z m-109.44615368 52.71603084l-221.15689357
         234.9161094V551.34164732h19.09653629v19.09949632h19.09949635v19.09949636h19.09949633v19.09653628h19.0965363V635.9395098l224.40724157-240.25046979-79.64241327-84.22191141zM339.89139478
         566.81484404l-8.21467844 8.59062901-29.98135419 114.98181039 117.06878231-36.47909065
         6.49181582-7.07202381h-8.96954017v-19.09653627h-19.09949634v-19.09949636h-19.09949635v-19.09653629h-19.09653629v-19.09949634H339.89139478v-3.62925968z m-22.92117217
         177.62058044v36.08833874h397.81835486v-36.08833875H316.97022262z' fill='#E55800'></path>
    </svg>
);

export const ErrorSvg = (props: any) => (
    <svg viewBox='0 0 1024 1024' width='21' height='21' className={props.className || ''} onClick={props.onClick}>
        <path d='M523.264 284.992h-22.016c-13.568 0-24.64 11.072-24.64 24.704V583.04c0 13.632 11.008 24.832 24.64 24.832h22.016c13.696 0
        24.768-11.2 24.768-24.832V309.696c0-13.632-11.072-24.704-24.768-24.704z m-11.2-249.6c-263.296 0-476.672 213.376-476.672
        476.672 0 263.04 213.376 476.544 476.672 476.544 263.104 0 476.672-213.504 476.672-476.544 0-263.296-213.568-476.672-476.672-476.672z
        m-4.352 893.824c-229.056 0-414.656-185.664-414.656-414.72 0-229.12 185.6-414.656 414.656-414.656 229.248 0 414.784 185.536 414.784
        414.656 0 229.056-185.536 414.72-414.784 414.72z m14.144-234.944h-20.608c-13.568 0-24.64 11.072-24.64 24.96v25.92c0 13.696 11.008
        24.896 24.64 24.896h20.608c13.696 0 24.768-11.2 24.768-24.896v-25.92c0-13.952-11.008-24.96-24.768-24.96z' fill='#E55800'></path>
    </svg>
);