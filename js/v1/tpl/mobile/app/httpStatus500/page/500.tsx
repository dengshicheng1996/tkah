import { Flex } from 'common/antd/mobile/flex';
import { RadiumStyle } from 'common/component/radium_style';
import { Radium } from 'common/radium';
import { staticImgURL } from 'common/staticURL';
import * as _ from 'lodash';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface HttpStatus502Props {
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
class HttpStatus500View extends React.Component<RouteComponentProps<any> & HttpStatus502Props, {}> {
    constructor(props: any) {
        super(props);
    }

    render() {

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            }}>
                <RadiumStyle scopeSelector={[]}
                    rules={{
                        '.container': {
                            textAlign: 'center',
                            width: '180px',
                            margin: '0 auto',
                            height: '100%',
                        },
                        '.title': {
                            margin: '5px 0  15px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'rgba(90,90,90,1)',
                            lineHeight: '20px',
                        },
                    }} />
                <Flex className='container' justify='center'>
                    <Flex.Item>
                        <img src={staticImgURL('500.png')}
                            width='187' />
                        <div className='title'>网络异常，请联系管理员</div>
                    </Flex.Item>
                </Flex>
            </div>
        );
    }
}

export const HttpStatus500 = withRouter(HttpStatus500View);
