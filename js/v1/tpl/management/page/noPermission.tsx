import {staticBaseURL} from 'common/staticURL';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
class Home extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        setTimeout(() => {
            props.history.push('/management/home');
        }, 3000);
    }
    render() {
        return (
                <div>
                    <div>
                        <img src={staticBaseURL('noPermission.png')} />
                    </div>
                </div>
        );
    }

}
export default withRouter(Home);
