import { Card } from 'common/antd/card';
import * as React from 'react';
export default class CardClass extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
                <div style={{marginBottom: '20px'}}>
                    <Card
                        headStyle={{borderBottom: 'none'}}
                        title={<span style={{color: '#0099FF', borderBottom: '3px solid #0099FF', padding: '0 0px 10px 0', display: 'inline-block', width: 120}}>{this.props.title}</span>}
                        extra={this.props.topButton}
                    >
                        {
                            this.props.content
                        }
                    </Card>
                </div>
        );
    }
}
