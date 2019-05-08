import { Badge, Breadcrumb, Button, Dropdown, Icon, Layout, List, Menu, Modal, notification, Tabs, Tooltip } from 'antd';
import { loginRequired, withAuth, WithAuth } from 'common/auth';
import { SearchToObject } from 'common/fun';
import * as _ from 'lodash';
import { WithAppState, withAppState } from 'management/common/appStateStore';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ApiUrls, GetCookie, GetSiteConfig } from '../common/publicData';
import { RadiumStyle } from '../common/radium_style';
const TabPane = Tabs.TabPane;
declare const window: any;

interface Nav {
    menuId: string | number;
    icon?: string;
    iconType?: number;
    title: string;
    url: string;
    children?: Nav[];
}
const StyleCompatibility = (props: {}) => (
    <div>
        <RadiumStyle scopeSelector={[]}
                     rules={{
                         '.detialShowGroup2': {
                             display: 'inline-block',
                             textAlign: 'left',
                             private: 'relative',
                         },
                     }} />
    </div>
);

@loginRequired
@observer
export class LayoutBaseView extends React.Component<any & WithAppState & WithAuth> {
    private search: any = SearchToObject(this.props.location.search);
    private disposers: Array<() => void> = [];
    // private aRefreshPermissionPath: string[];
    // private version: { [key: string]: any };
    // private showJudgeBrowser: boolean = true;

    // 菜单列表
    @observable private menuList: Nav[] = [
        {
            menuId: 1,
            title: '测试一级菜单1',
            url: '/url/test1',
        },
        {
            menuId: 2,
            title: '测试一级菜单2',
            url: '/url/test2',
            children: [
                {
                    menuId: 5,
                    title: '测试二级菜单1',
                    url: '/url/test2/test3',
                },
                {
                    menuId: 7,
                    title: '测试二级菜单1',
                    url: '/url/test2/test3',
                },
            ],
        },
    ];
    // 展开菜单
    @observable private openKeys: string[] = this.props.location.pathname.split('/').slice(1).map((r: string) => `/${r}`);
    // 是否显示隐藏菜单
    @observable private collapsed: boolean = false;
    // 更换浏览器提示URL
    @observable private judgeBrowserUrl: string;
    // 所有公司
    @observable private companyList: Array<{
        id: string;
        isCurrent: number;
        name: string;
        shortName: string;
    }> = [];
    // 当前公司
    @observable private currentCompany: string;
    // 公司到期时间
    @observable private expireDays: number = 16;
    @observable private panes: any[];
    // 流量广场权限
    @observable private flowSquareflowSquare: boolean = false;
    // 用户首次登录显示框
    @observable private firstLogin: boolean = false;
    // 签署合同 个数
    @observable private contractCount: number = 0;
    // API URL
    @observable private api: string = (() => {
        const apiKey = GetCookie('apiKey') || 'alpha1';

        const o = _.find(ApiUrls, (r) => {
            return r.value === apiKey;
        });
        return o.label;
    })();

    // 体验模式
    @observable private isExp: number;
    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.props.data.appState.currentUser.cid = this.search.cid ? parseInt(this.search.cid) : this.props.data.appState.currentUser.cid;
        this.props.data.appState.currentUser.channelId = this.search.channelId ? parseInt(this.search.channelId) : this.props.data.appState.currentUser.channelId;
        this.props.data.appState.currentUser.productId = this.search.productId ? parseInt(this.search.productId) : this.props.data.appState.currentUser.productId;
        this.setData();
    }

    componentDidUpdate() {
        this.setData();
    }

    setData() {
        if (this.props.auth.status.state === 'user') {
            const token = this.props.auth.status.user.token ?
                this.props.auth.status.user.token : window.app && window.app.token ? window.app.token : undefined;

            this.props.data.appState.currentUser = Object.assign({}, this.props.data.appState.currentUser, {
                id: this.props.auth.status.user.id,
                cuid: this.props.auth.status.user.id,
                username: this.props.auth.status.user.name,
                email: this.props.auth.status.user.email,
                permissions: this.props.auth.status.user.tags,
                token,
            });

            if (!window.app.token) {
                window.app.token = token;
            }
        }
    }
    /**
     * 切换菜单
     */
    toggle = () => {
        if (!this.collapsed) {
            this.openKeys = [];
        }
        this.collapsed = !this.collapsed;
    }
    makeMenuItem(menuList: Nav[], parentUrl?: string) {
        return menuList.map((r: Nav, i: number) => {
            const icon = r.icon;
            const url = `${parentUrl || ''}/${r.url}`;
            const title = r.title;
            if (r.children && r.children.length > 0) {
                return (
                    <Menu.SubMenu
                        key={url}
                        title={<span>
                            <span>{title}</span>
                        </span>}
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
    render() {
        const content = this.props.children;
        const companyInfo: any = {};
        const selectColor = GetSiteConfig(this.props.data.siteConfigState, 'style', 'baseLayout.menu.selectColor') || '';
        // 处理导航栏的选中项
        const pathnameArr = this.props.location.pathname.split('/').slice(1);
        const selectKeys = pathnameArr.length > 2 ? ['/' + pathnameArr.slice(0, 2).join('/')] : [this.props.location.pathname];
        return (
            <div style={GetSiteConfig(this.props.data.siteConfigState, 'style', 'baseLayout.bg')}>
                <StyleCompatibility />
                <RadiumStyle scopeSelector={[]}
                             rules={{
                                 'html, body': {
                                     minWidth: 0,
                                 },
                                 '.layoutHeader': {
                                     background: '#fff',
                                     padding: 0,
                                     position: 'fixed',
                                     zIndex: 1,
                                     top: 0,
                                     left: this.collapsed ? '80px' : '200px',
                                     right: 0,
                                     overflow: 'hidden',
                                 },
                                 '.layoutHeader .trigger': {
                                     verticalAlign: 'middle',
                                     fontSize: '18px',
                                     lineHeight: '64px',
                                     padding: '0 24px',
                                     cursor: 'pointer',
                                     transition: 'color .3s',
                                 },
                                 '.layoutHeader .trigger:hover': {
                                     color: '#1890ff',
                                 },
                                 '.layoutSider': {
                                     background: 'transparent',
                                 },
                                 '.layoutSider .logo': {
                                     height: '78px',
                                     padding: this.collapsed ? '16px 8px' : '16px 16px',
                                     textAlign: this.collapsed ? 'center' : 'left',
                                     overflow: 'hidden',
                                     position: 'fixed',
                                     top: 0,
                                     left: 0,
                                     width: this.collapsed ? '80px' : '200px',
                                     zIndex: 2,
                                 },
                                 '.layoutSider .menuBox': {
                                     overflow: 'auto',
                                     position: 'absolute',
                                     top: '78px',
                                     left: 0,
                                     right: 0,
                                     bottom: '66px',
                                     backgroundColor: 'transparent',
                                     MsOverflowStyle: 'none',
                                 },
                                 '.layoutSider .menuBox::-webkit-scrollbar': {
                                     width: '0 !important',
                                 },
                                 '.layoutSider .menu': {
                                     minHeight: '100%',
                                     backgroundColor: 'transparent',
                                 },
                                 '.layoutSider .menu .ant-menu-submenu .ant-menu-item': {
                                     backgroundColor: 'transparent',
                                 },
                                 '.layoutSider .menu.ant-menu-dark .ant-menu-inline.ant-menu-sub': {
                                     boxShadow: 'none',
                                     backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                 },
                                 '.layoutSider .ant-menu.ant-menu-dark .ant-menu-item-selected': GetSiteConfig(this.props.data.siteConfigState, 'style', 'baseLayout.menu.selected') || {},
                                 '.layoutSider .ant-menu.ant-menu-dark .ant-menu-item-selected>*': { marginLeft: '-6px' },
                                 '.layoutSider .footer': {
                                     color: '#fff',
                                     textAlign: 'center',
                                     position: 'fixed',
                                     left: 0,
                                     bottom: 0,
                                     width: '200px',
                                     padding: '15px',
                                     backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                     display: this.collapsed ? 'none' : 'block',
                                     zIndex: 1,
                                 },
                                 '.layoutSider .ant-menu-item-active': {
                                     backgroundColor: selectColor,
                                 },
                                 '.ant-dropdown-menu-item:hover,.ant-dropdown-menu-item:hover a': {
                                     backgroundColor: selectColor,
                                     color: '#fff !important',
                                 },
                             }} />
                <Layout style={_.assign({ height: '100%' }, GetSiteConfig(this.props.data.siteConfigState, 'style', 'baseLayout.shade'))}>
                    <Layout.Sider
                        className='layoutSider'
                        style={{
                            height: '100vh',
                        }}
                        trigger={null}
                        collapsible
                        collapsed={this.collapsed}
                    >
                        <div className='logo'>
                            <img src={companyInfo.logo}
                                 style={{
                                     width: '46px',
                                     height: '46px',
                                     borderRadius: '2px',
                                     marginRight: this.collapsed ? '0' : '10px',
                                     verticalAlign: 'middle',
                                 }} />
                            <div style={{ display: this.collapsed ? 'none' : 'inline-block', verticalAlign: 'middle', maxWidth: '112px' }}>
                                <Tooltip title={companyInfo.shortName}>
                                    <div style={{
                                        fontFamily: 'PingFangSC-Regular',
                                        fontSize: '16px',
                                        color: '#FFFFFF',
                                        letterSpacing: '0.8px',
                                        height: '22px',
                                        lineHeight: '22px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>{companyInfo.shortName}</div>
                                </Tooltip>
                                <div className='type' style={GetSiteConfig(this.props.data.siteConfigState, 'style', 'baseLayout.version')}>{companyInfo.versionName}</div>
                            </div>
                        </div>
                        <div className='menuBox'>
                            <Menu theme='dark'
                                  className='menu'
                                  mode='inline'
                                  selectedKeys={selectKeys}
                                  openKeys={toJS(this.openKeys)}
                                  onOpenChange={(openKeys) => {
                                      const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1);
                                      this.openKeys = latestOpenKey ? [latestOpenKey] : openKeys;
                                  }}
                                  onClick={(item) => {
                                      if (item.key.indexOf('$custom$') !== -1) {
                                          window.open(item.key.split('$custom$')[1]);
                                          return;
                                      }
                                      this.props.router.push(item.key);
                                  }}
                            >
                                {this.makeMenuItem(this.menuList)}
                            </Menu>
                        </div>
                        {/*<div className='footer'>*/}
                        {/*    <div>{this.version.system_name}</div>*/}
                        {/*    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.25)' }}>{this.version.description}</div>*/}
                        {/*</div>*/}
                    </Layout.Sider>
                    <Layout style={{ height: '100vh' }}>
                        <Layout.Header className='layoutHeader'>
                            <Icon
                                className='trigger'
                                type={this.collapsed ? 'menu-unfold' : 'menu-fold'}
                                onClick={this.toggle}
                            />
                            <div style={{ float: 'right', fontSize: '14px' }}>
                                {/*<Dropdown trigger={['click']} overlay={(*/}
                                {/*    <Menu>*/}
                                {/*        {*/}
                                {/*            this.companyList.map((r, i) => {*/}
                                {/*                return (*/}
                                {/*                    <Menu.Item key={i}>*/}
                                {/*                        <a style={{ fontSize: '14px' }} onClick={() => {*/}
                                {/*                            this.changeCompany(r.isCurrent, r.id);*/}
                                {/*                        }}>{r.shortName}</a>*/}
                                {/*                    </Menu.Item>*/}
                                {/*                );*/}
                                {/*            })*/}
                                {/*        }*/}
                                {/*    </Menu>*/}
                                {/*)} placement='bottomLeft'>*/}
                                {/*    <div style={{*/}
                                {/*        lineHeight: '64px',*/}
                                {/*        display: 'inline-block',*/}
                                {/*        marginRight: '24px',*/}
                                {/*        cursor: 'pointer',*/}
                                {/*    }}>*/}
                                {/*        <Icon type='crown' style={{*/}
                                {/*            marginRight: '8px',*/}
                                {/*            fontSize: '16px',*/}
                                {/*            verticalAlign: 'middle',*/}
                                {/*            color: '#E55800',*/}
                                {/*        }} />*/}
                                {/*        {this.currentCompany}*/}
                                {/*        <Icon type='caret-down' style={{*/}
                                {/*            marginLeft: '3px',*/}
                                {/*            fontSize: '16px',*/}
                                {/*            verticalAlign: 'middle',*/}
                                {/*            color: '#E55800',*/}
                                {/*        }} />*/}
                                {/*    </div>*/}
                                {/*</Dropdown>*/}
                                <Dropdown trigger={['click']} overlay={(
                                    <Menu>
                                        <Menu.Item>
                                            <span>{companyInfo.roleName}：{companyInfo.accountName}</span>
                                        </Menu.Item>
                                        <Menu.Item>
                                            <a style={{ fontSize: '14px', color: '#1890FF' }} onClick={() => {
                                                this.props.router.push(`/personal`);
                                            }}>个人设置</a>
                                        </Menu.Item>
                                        <Menu.Item>
                                            <a style={{ fontSize: '14px', color: '#1890FF' }} onClick={() => {
                                                window.location.href = '/logout';
                                            }}>退出系统</a>
                                        </Menu.Item>
                                    </Menu>
                                )} placement='bottomLeft'>
                                    <div style={{
                                        lineHeight: '64px',
                                        display: 'inline-block',
                                        marginRight: '24px',
                                        cursor: 'pointer',
                                    }}>
                                        <Icon type='user' style={{
                                            marginRight: '8px',
                                            fontSize: '16px',
                                            verticalAlign: 'middle',
                                            color: '#E55800',
                                        }} />
                                        {companyInfo.accountName}
                                    </div>
                                </Dropdown>
                            </div>
                        </Layout.Header>
                        <Layout.Content style={{
                            margin: '64px 0 0',
                            background: '#fff',
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            overflow: 'auto',
                        }}>
                            <div id='fixSelect' style={{
                                minWidth: '900px',
                                padding: 15,
                                background: '#eee',
                                position: 'relative',
                                minHeight: '100%',
                            }}>
                                {/*{pathnameArr[0] === 'dashboard' ?*/}
                                {/*    <div style={{*/}
                                {/*        padding: 12,*/}
                                {/*        background: '#eee',*/}
                                {/*    }}>*/}
                                {/*        {content}*/}
                                {/*    </div> : <div style={{*/}
                                {/*        padding: 12,*/}
                                {/*        background: '#fff',*/}
                                {/*    }}>*/}
                                {/*        {content}*/}
                                {/*    </div>*/}
                                {/*}*/}
                                <Tabs
                                    // onChange={this.onChange}
                                    // activeKey={this.state.activeKey}
                                    type='editable-card'
                                    // onEdit={this.onEdit}
                                >
                                    {this.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
                                </Tabs>
                            </div>
                        </Layout.Content>
                    </Layout>
                </Layout>
            </div>
        );
    }

}

export const LayoutBase = withRouter(withAuth(withAppState(LayoutBaseView)));
