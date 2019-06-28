import { staticImgURL } from 'common/staticURL';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import {withAppState} from '../../common/appStateStore';
import Title from '../../common/TitleComponent';
class Home extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        props.data.appState.panes = [];
        setTimeout(() => {
            props.history.push('/management/home');
        }, 3000);
    }
    render() {
        return (
            <Title>
                <div style={{ textAlign: 'center', padding: '200px 0 300px 0' }}>
                    <img src={staticImgURL('noPermission.png')} />
                </div>
            </Title>
        );
    }

}
export default withRouter(withAppState(Home));
