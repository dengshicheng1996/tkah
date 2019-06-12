import * as React from 'react';
import {mutate} from '../../../common/component/restFull';
import Title from '../../common/TitleComponent';
export default class Home extends React.Component<{}, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            color: 'blue',
        };
    }
    async componentDidMount() {
        const res: any = await mutate<{}, any>({
            url: '/api/admin/customer/section?date=' + new Date().getTime(),
            method: 'get',
        });
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
