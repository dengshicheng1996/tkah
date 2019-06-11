import { Button } from 'common/antd/mobile/button';
import { Flex } from 'common/antd/mobile/flex';
import { AppFn, IsAppPlatform } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { Radium } from 'common/radium';
import { staticBaseURL } from 'common/staticURL';
import * as _ from 'lodash';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface HttpStatus404Props {
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
class HttpStatus404View extends React.Component<RouteComponentProps<any> & HttpStatus404Props, {}> {
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
                            margin: '15px 0  15px',
                            paddingBottom: '10px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'rgba(90,90,90,1)',
                            lineHeight: '20px',
                            borderBottom: '1px dashed rgba(229,229,229,1)',
                        },
                        '.description': {
                            fontSize: '13px',
                            fontWeight: 400,
                            color: 'rgba(90,90,90,1)',
                            lineHeight: '20px',
                            textAlign: 'left',
                        },
                        '.description .cause': {
                            marginBottom: '10px',
                        },
                        '.btn': {
                            background: 'rgba(229,88,0,1)',
                            boxShadow: '0px 1px 5px 0px rgba(171,171,171,0.6)',
                            borderRadius: '50px',
                            marginTop: '40px',
                            padding: '15px 38px',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#fff',
                            display: 'inline-block',
                        },
                    }} />
                <Flex className='container' justify='center'>
                    <Flex.Item>
                        <img src={staticBaseURL('404.png')}
                            width='187' />
                        <div className='title'>哎呀，迷路了...</div>
                        <div className='description'>
                            <div className='cause'>可能的原因：</div>
                            <div>原来的页面不存在</div>
                            <div>我们的服务器被外星人劫持了</div>
                        </div>
                        <div className='btn' onClick={() => {
                            if (IsAppPlatform()) {
                                AppFn.actionFinish();
                            } else {
                                window.history.back();
                            }
                        }}>返回首页</div>
                    </Flex.Item>
                </Flex>
            </div>
        );
    }
}

export const HttpStatus404 = withRouter(HttpStatus404View);
