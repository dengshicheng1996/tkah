import { Card } from 'common/antd/mobile/card';
import { Radium } from 'common/radium';
import { staticBaseURL } from 'common/staticURL';
import * as _ from 'lodash';
import * as React from 'react';

interface FrameProps {
    title?: string;
    footer?: React.ReactNode;
    bg?: string;
    fullHeight?: boolean;
}

@Radium
export class Frame extends React.Component<FrameProps, {}> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div>
                <div style={{
                    backgroundImage: `url(${this.props.bg || staticBaseURL('bg_card.png')})`,
                    backgroundSize: 'cover',
                    position: 'fixed',
                    height: '210px',
                    width: '100%',
                    top: 0,
                    zIndex: 1,
                }}>
                    <div style={{
                        position: 'relative',
                        color: '#fff',
                        borderLeft: '3px solid #fff',
                        paddingLeft: '8px',
                        margin: '26px 29px',
                    }}>
                        <div style={{ fontSize: '25px', marginBottom: '7px' }}>{this.props.title || '申请表'}</div>
                        <div style={{ fontSize: '13px' }}>信用生活，点滴之间</div>
                    </div>
                </div>
                <div style={{
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 2,
                    padding: this.props.footer ? '110px 13px 80px' : '20px 13px',
                }}>
                    <Card style={{ height: this.props.fullHeight ? '100%' : 'auto', width: '100%' }}>
                        <Card.Body style={{ padding: '30px' }}>
                            {this.props.children}
                        </Card.Body>
                    </Card>
                    {
                        this.props.footer ?
                            (
                                <div style={{ maxHeight: '75px', overflow: 'auto' }}>
                                    {this.props.footer}
                                </div>
                            ) : null
                    }
                </div>
            </div>
        );
    }

}
