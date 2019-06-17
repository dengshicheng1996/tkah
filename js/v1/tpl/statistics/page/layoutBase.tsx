import { Icon } from 'common/antd/icon';
import { Layout } from 'common/antd/layout';
import { Menu } from 'common/antd/menu';
import { loginRequired } from 'common/component/auth';
import { RadiumStyle } from 'common/component/radium_style';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { withAppState, WithAppState } from 'operatePlat/common/appStateStore';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Nav, NavProps } from '../common/publicData';
import { routes } from './routes';

const { Header, Content, Footer } = Layout;

@loginRequired
@Radium
@observer
export class LayoutBaseView extends React.Component<RouteComponentProps<any> & WithAppState> {

    constructor(props: any) {
        super(props);
    }

    render() {
        const pathArr = this.props.location.pathname.split('/');
        const selectedKeys = pathArr.length > 2 ? [pathArr.slice(0, 3).join('/')] : [`${this.props.location.pathname}`];

        return (
            <Layout>
                <RadiumStyle scopeSelector={['.operatePlat']}
                    rules={{
                        '#reactApp': {
                            backgroundColor: '#f0f2f5 !important',
                        },
                        '.admin': {
                            float: 'right',
                            position: 'relative',
                            minWidth: '120px',
                            cursor: 'pointer',
                        },
                        '.admin-user': {
                            paddingTop: '6px',
                            backgroundColor: '#0099ff',
                            borderRadius: '50%',
                            fontSize: '16px',
                            margin: '0 10px 0 0',
                            display: 'inline-block',
                            width: '30px',
                            height: '30px',
                            position: 'relative',
                            verticalAlign: 'middle',
                        },
                        '.admin:hover': {
                            backgroundColor: '#fff',
                            color: '#000',
                        },
                        '.admin:hover .admin-user': {
                            color: '#fff',
                        },
                        '.admin > a': {
                            textDecoration: 'none',
                            color: '#fff',
                            lineHeight: '50px',
                            display: 'inline-block',
                            padding: '0 25px',
                        },
                        '.admin:hover > a': {
                            backgroundColor: '#fff',
                            color: '#000',
                        },
                        '.user-center': {
                            position: 'absolute',
                            right: 0,
                            zIndex: 2,
                            background: '#fff',
                            width: '100%',
                            display: 'none',
                        },
                        '.user-center a': {
                            borderLeft: '1px #adadad solid',
                            borderRight: '1px #adadad solid',
                            borderBottom: '1px #adadad solid',
                            boxShadow: '0px 0px 5px #7d7d7d',
                            display: 'block',
                            width: '100%',
                            height: '50px',
                            textAlign: 'center',
                            lineHeight: '50px',
                            color: '#000',
                            transition: 'none',
                            textDecoration: 'none',
                        },
                        '.admin:hover .user-center': {
                            display: 'block',
                        },
                        '.user-center a:hover': {
                            color: '#0099FF',
                            background: 'rgba(228, 228, 228, 0.5)',
                        },
                    }} />
                <Header style={{ position: 'fixed', zIndex: 1, width: '100%', height: 'auto' }}>
                    <div className='admin'>
                        <a>
                            <Icon type='user' className='admin-user' theme='outlined' />
                            <span>
                                信息
                            </span>
                        </a>
                        < div className='user-center' >
                            <a href='/operatePlat/user/logout'>退出</a>
                        </div>
                    </div>
                    <Menu
                        theme='dark'
                        mode='horizontal'
                        selectedKeys={selectedKeys}
                        style={{ lineHeight: '64px' }}
                        onClick={(item) => {
                            this.props.history.push(item.key.replace('.$', ''));
                        }}
                    >
                        {this.makeMenuItem(Nav[0].children, '/operatePlat')}
                    </Menu>
                </Header>
                <Content id='fixSelect' style={{ padding: '0 50px', marginTop: 64 }}>
                    <div style={{
                        minHeight: 380,
                        marginTop: '16px',
                        background: '#fff',
                        overflow: 'auto',
                    }}>
                        {routes}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                </Footer>
            </Layout>
        );
    }

    private makeMenuItem = (menuList: NavProps[], parentUrl?: string) => {
        return menuList.map((r: NavProps, i: number) => {
            const url = `${parentUrl || ''}/${r.url}`;
            const title = r.title;

            if (r.children && r.children.length > 0) {
                return (
                    <Menu.SubMenu
                        key={url}
                        title={<span>{title}</span>}
                    >
                        {this.makeMenuItem(r.children, url)}
                    </Menu.SubMenu>
                );
            }

            return (
                <Menu.Item key={url}>
                    <span>{title}</span>
                </Menu.Item>
            );
        });
    }

}

export const LayoutBase = withRouter(withAppState(LayoutBaseView));
