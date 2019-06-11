import { RadiumStyle } from 'common/component/radium_style';
import { Radium } from 'common/radium';
import { staticBaseURL } from 'common/staticURL';
import * as _ from 'lodash';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface HttpStatus404Props {
    param: any;
    match: {
        params: {
            kind: string;
        };
    };
    location: {
        search: string;
    };
}

@Radium
class HttpStatus404View extends React.Component<RouteComponentProps<any> & HttpStatus404Props, {}> {
    constructor(props: any) {
        super(props);
    }

    render() {

        return (
            <div>
            </div>
        );
    }
}

export const HttpStatus404 = withRouter(HttpStatus404View);
