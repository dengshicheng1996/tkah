import { staticImgURL } from 'common/staticURL';
import * as React from 'react';
import Title from '../../common/TitleComponent';
export default class Home extends React.Component<{}, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            color: 'blue',
        };
    }
    render() {
        return (
            <Title>
                <div style={{ textAlign: 'center', padding: '200px 0 300px 0' }}>
                    <img src={staticImgURL('success.png')} />
                    <p style={{ fontSize: '22px', marginTop: '5px' }}>欢迎使用后台管理系统</p>
                </div>
            </Title>
        );
    }

}
