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
            <Title title='仪表盘'>
                <div>
                    <a onClick={() => {
                        this.setState({color: 'red'});
                    }}>
                        <span style={{color: this.state.color}}>欢迎使用</span>
                    </a>
                </div>
            </Title>
        );
    }

}
