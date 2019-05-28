import { Dropdown } from 'common/antd/dropdown';
import { Icon } from 'common/antd/icon';
import { Layout } from 'common/antd/layout';
import { Menu } from 'common/antd/menu';
import { Spin } from 'common/antd/spin';
import { Tooltip } from 'common/antd/tooltip';
import { loginRequired, withAuth, WithAuth } from 'common/component/auth';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate, Querier } from 'common/component/restFull';
import 'jquery.cookie';
import * as _ from 'lodash';
import { WithAppState, withAppState } from 'management/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { routes } from './management/routes';
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
export class LayoutBaseView extends React.Component<any & WithAppState & WithAuth, {}> {
    private menusQuery: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    // 菜单列表
    @observable private menuList: Nav[] = [
        {
            menuId: 2,
            title: '基础配置',
            url: 'basic',
            children: [
                {
                    menuId: 5,
                    title: '初始化配置',
                    url: 'init',
                },
                {
                    menuId: 7,
                    title: '渠道配置',
                    url: 'channel',
                },
                {
                    menuId: 8,
                    title: '账号管理',
                    url: 'account',
                },
                {
                    menuId: 11,
                    title: '角色权限',
                    url: 'role',
                },
            ],
        },
        {
            menuId: 3,
            title: '客户管理',
            url: 'custorm',
            children: [
                {
                    menuId: 4,
                    title: '客户列表',
                    url: 'list',
                },
                {
                    menuId: 9,
                    title: '渠道访问记录',
                    url: 'channelRecord',
                },
            ],
        },
        {
            menuId: 3,
            title: '授信放款',
            url: 'credit',
            children: [
                {
                    menuId: 4,
                    title: '审核授信',
                    url: 'audit',
                },
                {
                    menuId: 9,
                    title: '提现放款',
                    url: 'withdraw',
                },
            ],
        },
        // {
        //     menuId: 3,
        //     title: '贷后管理',
        //     url: 'afterLoan',
        // },
        // {
        //     menuId: 3,
        //     title: '催收管理',
        //     url: 'collection',
        // },
        {
            menuId: 3,
            title: '消费和支付交易',
            url: 'consumption',
            children: [
                {
                    menuId: 4,
                    title: '查询计费',
                    url: 'billing',
                },
                {
                    menuId: 9,
                    title: '短信记录',
                    url: 'note',
                },
                {
                    menuId: 9,
                    title: '支付流水',
                    url: 'payOrder',
                },
            ],
        },
    ];
    @observable private loading: boolean = false;
    // 展开菜单
    @observable private openKeys: string[] = this.props.location.pathname.split('/').slice(1).map((r: string) => `/${r}`);
    // 是否显示隐藏菜单
    @observable private collapsed: boolean = false;
    // 所有公司
    @observable private companyList: any[] = [];
    @observable private currentInfo: any = {};
    // 当前公司
    @observable private currentCompany: string;
    @observable private companyInfo: any = {};
    // 公司到期时间
    @observable private expireDays: number = 16;
    // @observable private panes: any[] = [];
    // @observable private activePane: string = '';

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }
    componentDidMount() {
        this.getCompanyInfo();
        this.getCompanyList();
        this.getCurrentInfo();
    }
    // async componentWillMount() {
    //     const pathname = this.props.location.pathname;
    //     const menuInfo = this.menuInfo(pathname);
    //     // const children = _.cloneDeep(this.props.children);
    //     const content = Home;
    //     console.log(content)
    //     this.panes.push({title: menuInfo.title, url: menuInfo.url, key: menuInfo.url, content});
    //     this.activePane = menuInfo.url;
    // }
    // shouldComponentUpdate(nextProps) {
    //     const pathname = nextProps.location.pathname;
    //     const menuInfo = this.menuInfo(pathname);
    //     if (this.props.location.pathname !== pathname) {
    //         let test = false;
    //         this.panes.map(item => {
    //             if (item.url === pathname) {
    //                 test = true;
    //             }
    //         });
    //         const children = _.cloneDeep(nextProps.children);
    //         if (!test) {
    //             const content = test3222;
    //             this.panes.push({title: menuInfo.title, url: menuInfo.url, key: menuInfo.url, content});
    //         }
    //     }
    //     console.log(this.panes);
    //     return true;
    // }
    // componentDidUpdate() {
    // }
    // panesChange(data) {
    //     this.activePane = data;
    // }
    // panesDelete(data) {
    //     const arr = [];
    //     this.panes.map(item => {
    //         if (item.url !== data) {
    //             arr.push(item);
    //         }
    //     });
    //     this.panes = arr;
    //     if (this.activePane === data) {
    //         this.activePane = arr[0].url;
    //     }
    // }
    getCompanyInfo() {
        mutate<{}, any>({
            url: '/api/admin/company',
            method: 'get',
        }).then(r => {
            if (r.status_code === 200) {
                this.companyInfo = r.data;
            }
        });
    }
    getCompanyList() {
        mutate<{}, any>({
            url: '/api/admin/account/current/company/list',
            method: 'get',
        }).then(r => {
            if (r.status_code === 200) {
                this.companyList = r.data;
                console.log(this.companyList);
            }
        });
    }
    getCurrentInfo() {
        mutate<{}, any>({
            url: '/api/admin/account/current',
            method: 'get',
        }).then(r => {
            if (r.status_code === 200) {
                this.currentInfo = r.data;
            }
        });
    }
    changeCompany(current: boolean, id: number|string) {
        if (current) {
            return;
        } else {
            console.log(id);
        }
    }
    menuInfo(url: string) {
        const menu = this.menuList;
        const urlArr = url.split('/');
        let info = {};
        menu.map(item => {
            if (item.url === urlArr[1]) {
                if (urlArr.length === 2) {
                    info = { title: item.title, url: `/${item.url}` };
                }
                const children = item.children;
                if (item.children.length > 0) {
                    children.map(it => {
                        if (it.url === urlArr[2]) {
                            info = { title: it.title, url: `/${item.url}/${it.url}` };
                        }
                    });
                }
            }
        });
        return info;
    }

    getMenu() {
        this.menusQuery.setReq({
            url: `/api/admin/hasmenus`,
            method: 'get',
        });

        this.disposers.push(autorun(() => {
            this.loading = this.menusQuery.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.menusQuery.result, 'result.data.menus') as any) || [];
        }, searchData => {
            // this.menuList = searchData;
            this.menuList = [
                {
                    menuId: 2,
                    title: '基础配置',
                    url: 'basic',
                    children: [
                        {
                            menuId: 5,
                            title: '初始化配置',
                            url: 'init',
                        },
                        {
                            menuId: 7,
                            title: '渠道配置',
                            url: 'channel',
                        },
                        {
                            menuId: 8,
                            title: '账号管理',
                            url: 'account',
                        },
                        {
                            menuId: 11,
                            title: '角色权限',
                            url: 'role',
                        },
                    ],
                },
                {
                    menuId: 3,
                    title: '客户管理',
                    url: 'management',
                    children: [
                        {
                            menuId: 4,
                            title: '测试二级菜单31',
                            url: 'home',
                        },
                        {
                            menuId: 9,
                            title: '测试二级菜单32',
                            url: 'test3222',
                        },
                    ],
                },
                {
                    menuId: 3,
                    title: '授信放款',
                    url: 'management',
                    children: [
                        {
                            menuId: 4,
                            title: '审核授信',
                            url: 'home',
                        },
                        {
                            menuId: 9,
                            title: '提现放款',
                            url: 'test3222',
                        },
                    ],
                },
                {
                    menuId: 3,
                    title: '贷后管理',
                    url: 'afterLoan',
                },
                {
                    menuId: 3,
                    title: '催收管理',
                    url: 'collection',
                },
                {
                    menuId: 3,
                    title: '消费和支付交易',
                    url: 'consumption',
                    children: [
                        {
                            menuId: 4,
                            title: '查询计费',
                            url: 'billing',
                        },
                        {
                            menuId: 9,
                            title: '短信记录',
                            url: 'note',
                        },
                        {
                            menuId: 9,
                            title: '支付流水',
                            url: 'payOrder',
                        },
                    ],
                },
            ];
        }));
    }

    toggle = () => {
        if (!this.collapsed) {
            this.openKeys = [];
        }
        this.collapsed = !this.collapsed;
    }

    makeMenuItem(menuList: Nav[], parentUrl?: string) {
        return (menuList || []).map((r: Nav, i: number) => {
            const icon = r.icon;
            const url = `${parentUrl || ''}/${r.url}`;
            const title = r.title;
            if (r.children && r.children.length > 0) {
                return (
                    <Menu.SubMenu
                        key={'/management' + url}
                        title={<span>
                            <span>{title}</span>
                        </span>}
                    >
                        {this.makeMenuItem(r.children, url)}
                    </Menu.SubMenu>
                );
            }
            return (
                <Menu.Item key={'/management' + url}>
                    <span>{title}</span>
                </Menu.Item>
            );
        });
    }

    render() {
        if (this.loading) {
            return (<Spin spinning={this.loading} />);
        }
        const content = this.props.children;
        const companyInfo: any = {};
        // const selectColor = GetSiteConfig(this.props.data.siteConfigState, 'style', 'baseLayout.menu.selectColor') || '';
        const selectColor = '';
        // 处理导航栏的选中项
        const pathnameArr = this.props.location.pathname.split('/').slice(1);
        const selectKeys = pathnameArr.length > 3 ? ['/' + pathnameArr.slice(0, 3).join('/')] : [this.props.location.pathname];
        return (
            <div>
                <StyleCompatibility />
                <RadiumStyle scopeSelector={[]}
                    rules={{
                        'html, body': {
                            minWidth: 0,
                        },
                        '.layoutHeader': {
                            background: '#fff',
                            border: '1px solid #eee',
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
                            backgroundColor: 'rgba(0, 33, 64, 1)',
                        },
                        '.layoutSider .menuBox': {
                            overflow: 'auto',
                            position: 'absolute',
                            top: '78px',
                            left: 0,
                            right: 0,
                            bottom: '66px',
                            backgroundColor: 'rgba(0, 21, 41, 1)',
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
                        '.layoutSider .ant-menu.ant-menu-dark .ant-menu-item-selected': { backgroundColor: 'rgba(23, 144, 255, 1)' },
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
                <Layout style={_.assign({ height: '100%' }, {})}>
                    <Layout.Sider
                        className='layoutSider'
                        style={{
                            height: '100vh',
                        }}
                        trigger={null}
                        collapsible
                        collapsed={this.collapsed}
                    >
                        <div className='logo' style={{ color: '#fff' }}>
                            <h2 style={{ color: '#fff', marginBottom: 0 }}>{this.companyInfo.name}</h2>
                            <div style={{ display: this.collapsed ? 'none' : 'inline-block', verticalAlign: 'middle', maxWidth: '112px' }}>
                                <Tooltip title={this.companyInfo.short_name}>
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
                                    }}>{this.companyInfo.short_name}</div>
                                </Tooltip>
                                <div className='type'>{companyInfo.versionName}</div>
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
                                    this.props.history.push(item.key);
                                }}
                            >
                                {this.makeMenuItem(this.menuList)}
                            </Menu>
                        </div>
                        <div className='footer'>
                            <div>阿尔法象智能云</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.25)' }}>Powered by AlphaElephant</div>
                        </div>
                    </Layout.Sider>
                    <Layout style={{ height: '100vh' }}>
                        <Layout.Header className='layoutHeader'>
                            <Icon
                                className='trigger'
                                type={this.collapsed ? 'menu-unfold' : 'menu-fold'}
                                onClick={this.toggle}
                            />
                            <div style={{ float: 'right', fontSize: '14px' }}>
                                <Dropdown trigger={['click']} overlay={(
                                    <Menu>
                                        {
                                            this.companyList.map((r, i) => {
                                                return (
                                                    <Menu.Item key={i}>
                                                        <a style={{ fontSize: '14px' }} onClick={() => {
                                                            this.changeCompany(r.is_current, r.id);
                                                        }}>{r.short_name}</a>
                                                    </Menu.Item>
                                                );
                                            })
                                        }
                                    </Menu>
                                )} placement='bottomLeft'>
                                    <div style={{
                                        lineHeight: '64px',
                                        display: 'inline-block',
                                        marginRight: '24px',
                                        cursor: 'pointer',
                                    }}>
                                        <Icon type='crown' style={{
                                            marginRight: '8px',
                                            fontSize: '16px',
                                            verticalAlign: 'middle',
                                            color: '#E55800',
                                        }} />
                                        {this.companyInfo.short_name}
                                        <Icon type='caret-down' style={{
                                            marginLeft: '3px',
                                            fontSize: '16px',
                                            verticalAlign: 'middle',
                                            color: '#E55800',
                                        }} />
                                    </div>
                                </Dropdown>
                                <Dropdown trigger={['click']} overlay={(
                                    <Menu>
                                        <Menu.Item>
                                            <span>{this.currentInfo.role_name}：{this.currentInfo.remark}</span>
                                        </Menu.Item>
                                        <Menu.Item>
                                            <a style={{ fontSize: '14px', color: '#1890FF' }} onClick={() => {
                                                this.props.router.push(`/personal`);
                                            }}>个人设置</a>
                                        </Menu.Item>
                                        <Menu.Item>
                                            <a style={{ fontSize: '14px', color: '#1890FF' }} onClick={() => {
                                                this.props.history.push(`/management/logout`);
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
                                        {this.currentInfo.remark}
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
                            {routes}
                            {/*<Tabs*/}
                            {/*    onChange={(data) => this.panesChange(data)}*/}
                            {/*    activeKey={this.activePane}*/}
                            {/*    type='editable-card'*/}
                            {/*    hideAdd*/}
                            {/*    onEdit={(data) => this.panesDelete(data)}*/}
                            {/*>*/}
                            {/*    {this.panes.map(pane =>*/}
                            {/*        <TabPane*/}
                            {/*            forceRender*/}
                            {/*            style={{background: '#fff'}}*/}
                            {/*            tab={pane.title}*/}
                            {/*            closable={this.panes.length !== 1}*/}
                            {/*            key={pane.key}>*/}
                            {/*        <div id='fixSelect' style={{*/}
                            {/*            minWidth: '900px',*/}
                            {/*            padding: 15,*/}
                            {/*            background: '#eee',*/}
                            {/*            position: 'relative',*/}
                            {/*            minHeight: '100%',*/}
                            {/*        }}>*/}
                            {/*        {pane.content}*/}
                            {/*        </div>*/}
                            {/*    </TabPane>)}*/}
                            {/*</Tabs>*/}
                        </Layout.Content>
                    </Layout>
                </Layout>
            </div>
        );
    }
}

export const LayoutBase = withRouter(withAuth(withAppState(LayoutBaseView)));
