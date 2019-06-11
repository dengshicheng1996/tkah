import * as React from 'react';
export default class Home extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
                <div>
                    <div>没有权限</div>
                    <a onClick={() => this.props.history.push('/management/home')}>返回首页</a>
                </div>
        );
    }

}
