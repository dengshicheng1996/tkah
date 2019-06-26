import { staticImgURL } from 'common/staticURL';
import * as React from 'react';
import { mutate } from '../../../common/component/restFull';
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
                <div style={{ textAlign: 'center', padding: '200px 0 300px 0' }}>
                    <img src={staticImgURL('success.png')} />
                    <p style={{ fontSize: '22px', marginTop: '5px' }}>欢迎使用后台管理系统</p>
                </div>
            </Title>
        );
    }

}
