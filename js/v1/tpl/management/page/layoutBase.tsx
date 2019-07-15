import { Col } from 'common/antd/col';
import { Dropdown } from 'common/antd/dropdown';
import { Icon } from 'common/antd/icon';
import { Layout } from 'common/antd/layout';
import { Menu } from 'common/antd/menu';
import { Row } from 'common/antd/row';
import { Spin } from 'common/antd/spin';
import { loginRequired, withAuth, WithAuth } from 'common/component/auth';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate, Querier } from 'common/component/restFull';
import * as $ from 'jquery';
import 'jquery.cookie';
import * as _ from 'lodash';
import { WithAppState, withAppState } from 'management/common/appStateStore';
import { menuTitle } from 'management/common/publicData';
import { observable, toJS } from 'mobx';
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
    @observable private menuList: Nav[] = [];
    //     [
    //     {
    //         menuId: 2,
    //         title: '基础配置',
    //         url: 'basic',
    //         children: [
    //             {
    //                 menuId: 5,
    //                 title: '初始化配置',
    //                 url: 'init',
    //             },
    //             {
    //                 menuId: 7,
    //                 title: '渠道配置',
    //                 url: 'channel',
    //             },
    //             {
    //                 menuId: 8,
    //                 title: '账号管理',
    //                 url: 'account',
    //             },
    //             {
    //                 menuId: 11,
    //                 title: '角色权限',
    //                 url: 'role',
    //             },
    //         ],
    //     },
    //     {
    //         menuId: 3,
    //         title: '客户管理',
    //         url: 'custorm',
    //         children: [
    //             {
    //                 menuId: 4,
    //                 title: '客户列表',
    //                 url: 'list',
    //             },
    //             {
    //                 menuId: 9,
    //                 title: '渠道访问记录',
    //                 url: 'channelRecord',
    //             },
    //         ],
    //     },
    //     {
    //         menuId: 3,
    //         title: '授信放款',
    //         url: 'credit',
    //         children: [
    //             {
    //                 menuId: 4,
    //                 title: '审核授信',
    //                 url: 'audit',
    //             },
    //             {
    //                 menuId: 9,
    //                 title: '提现放款',
    //                 url: 'withdraw',
    //             },
    //         ],
    //     },
    //     {
    //         menuId: 3,
    //         title: '贷后管理',
    //         url: 'afterLoaning',
    //     },
    //     // {
    //     //     menuId: 3,
    //     //     title: '催收管理',
    //     //     url: 'collection',
    //     // },
    //     {
    //         menuId: 3,
    //         title: '消费和支付交易',
    //         url: 'consumption',
    //         children: [
    //             {
    //                 menuId: 4,
    //                 title: '查询计费',
    //                 url: 'billing',
    //             },
    //             {
    //                 menuId: 9,
    //                 title: '短信记录',
    //                 url: 'note',
    //             },
    //             {
    //                 menuId: 9,
    //                 title: '支付流水',
    //                 url: 'payOrder',
    //             },
    //         ],
    //     },
    // ];
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
    @observable private panes: any[] = [];
    @observable private activePane: string = '';

    constructor(props: any) {
        super(props);
    }
    permission(pathname: string) {
        const arr = pathname.split('/');
        arr.splice(0, 2);
        if (arr[0] === 'home' || arr[0] === '') {
            return false;
        }
        let test = false;
        this.menuList.map((item: any) => {
            if (item.url === arr[0]) {
                if (item.children && item.children.length > 0) {
                    item.children.map((it: any) => {
                        if (it.url === arr[1]) {
                            test = true;
                        }
                    });
                } else {
                    test = true;
                }
            }
        });
        if (!test) {
            this.props.history.push('/management/noPermission');
        }
    }
    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }
    compatibility(data: any): Nav[] {
        const removeButton = (arr: any[]) => {
            arr.map((item: any, index: number) => {
                if (item.children && item.children.length) {
                    if (item.children[0].type === 'button') {
                        item.children = [];
                    } else {
                        removeButton(item.children);
                    }
                }
            });
        };
        const result = JSON.parse(JSON.stringify(data).replace(/menu_name/g, 'title').replace(/uri/g, 'url'));
        removeButton(result);
        return result;
    }
    componentDidMount() {
        this.getCompanyInfo();
        this.getCompanyList();
        this.getCurrentInfo();
        this.getMenu();
    }
    componentWillMount() {
        const pathname = this.props.location.pathname;
        const menuInfo: any = this.menuInfo(pathname);
        this.props.data.appState.panes.push({title: menuInfo.title, url: menuInfo.url, key: menuInfo.url});
        this.activePane = menuInfo.url;
    }
    shouldComponentUpdate(nextProps: any) {
        const pathname = nextProps.location.pathname;
        const search = nextProps.location.search;
        this.permission(pathname);
        const arr = pathname.split('/');
        arr.splice(1, 1);
        const shortPathname = arr.join('/');
        const menuInfo: any = this.menuInfo(pathname);
        if (this.props.location.pathname !== pathname) {
            let test = false;
            this.props.data.appState.panes.map((item: any) => {
                if (item.key === shortPathname) {
                    test = true;
                }
            });
            if (!test) {
                console.log(search);
                this.props.data.appState.panes.push({title: menuInfo.title, url: menuInfo.url + search, key: menuInfo.url});
            }
        }
        if (this.props.data.appState.panes.length > 6) {
            this.props.data.appState.panes.splice(0, 1);
        }
        this.activePane = shortPathname;
        return true;
    }
    panesChange(data: any) {
        this.activePane = data;
        this.props.history.push('/management' + data);
    }
    panesDelete(data: string) {
        const arr: any[] = [];
        const panes = this.props.data.appState.panes;
        panes.map((item: any) => {
            if (item.url !== data) {
                arr.push(item);
            }
        });
        this.props.data.appState.panes = arr;
        if (this.activePane === data) {
            this.activePane = arr[0].url;
            this.props.history.push('/management' + arr[0].url);
        }
    }
    getCompanyInfo() {
        mutate<{}, any>({
            url: '/api/admin/company',
            method: 'get',
        }).then(r => {
            if (r.status_code === 200) {
                this.companyInfo = r.data;
                this.props.data.appState.companyInfo = r.data;
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
            const json = {
                company_id: id,
            };
            mutate<{}, any>({
                url: '/api/change/company',
                method: 'put',
                variables: json,
            }).then(r => {
                if (r.status_code === 200) {
                    $.cookie('token', r.data.token, { path: '/' });
                    window.location.reload();
                }
            });
        }
    }
    menuInfo(url: string) {
        const menu = menuTitle;
        const urlArr = url.split('/');
        let title = '';
        const getTitle = (arr: any[], index: number) => {
            arr.map(item => {
                if (index === 4 && /^\d{0,}$/g.test(urlArr[index])) {
                    item.url = urlArr[index];
                }
                if (item.url === urlArr[index]) {
                    title = item.title;
                    if (item.children && item.children.length > 0) {
                        getTitle(item.children, index + 1);
                    }
                }
            });
        };
        getTitle(menu, 2);
        urlArr.splice(1, 1);
        const info = {title, url: urlArr.join('/')};
        return info;
    }
    getButton(menu: any) {
        const arr: number[] = [];
        const getButtonUrl = (data: any[]) => {
            data.map((item: any) => {
                if (item.type === 'button') {
                    arr.push(item.id);
                } else {
                    getButtonUrl(item.children);
                }
            });
        };
        getButtonUrl(menu);
        return arr;
    }
    getMenu() {
        mutate<{}, any>({
            url: '/api/admin/hasmenus',
            method: 'get',
        }).then(r => {
            if (r.status_code === 200) {
                this.menuList = this.compatibility(r.data.menus);  // 把接口的uri换成 url  menu_name  换成title
                this.props.data.appState.jurisdiction = this.getButton(r.data.menus);
                this.permission(this.props.location.pathname);
            }
        });
        // this.menusQuery.setReq({
        //     url: `/api/admin/hasmenus`,
        //     method: 'get',
        // });
        // this.disposers.push(autorun(() => {
        //     this.loading = this.menusQuery.refreshing;
        // }));
        //
        // this.disposers.push(reaction(() => {
        //     return (_.get(this.menusQuery.result, 'result.data.menus') as any) || [];
        // }, searchData => {
        //
        // }));
    }
    toggle = () => {
        if (!this.collapsed) {
            this.openKeys = [];
        }
        this.collapsed = !this.collapsed;
    }
    makeMenuItem(menuList: Nav[], parentUrl?: string) {
        return (menuList || []).map((r: any, i: number) => {
            const icon = r.icon;
            const url = `${parentUrl || ''}/${r.url}`;
            const title = r.title;
            if (r.children && r.children.length > 0 && r.children[0].type !== 'button') {
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
        const panes = this.props.data.appState.panes || [];
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
                            // bottom: '66px',
                            bottom: '0px',
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
                            <h2 style={{ color: '#fff', marginBottom: 0 }}>{this.companyInfo.short_name}</h2>
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
                        {/*<div className='footer'>*/}
                        {/*    <div>阿尔法象智能云</div>*/}
                        {/*    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.25)' }}>Powered by AlphaElephant</div>*/}
                        {/*</div>*/}
                    </Layout.Sider>
                    <Layout style={{ height: '100vh' }}>
                        <Layout.Header className='layoutHeader'>
                            <Icon
                                className='trigger'
                                type={this.collapsed ? 'menu-unfold' : 'menu-fold'}
                                onClick={this.toggle}
                                style={{float: 'left'}}
                            />
                            <Row style={{float: 'left', width: '62%', fontSize: '12px'}}>
                                    {
                                        panes.map((pane: any) =>
                                        <Col
                                            span={4}
                                            style={{textAlign: 'center', minWidth: '115px'}}
                                            key={pane.key}
                                        >
                                            <span
                                                style={{cursor: 'pointer', color: this.activePane === pane.key ? 'red' : ''}}
                                                onClick={() => this.props.history.push('/management' + pane.url)}>{pane.title}</span>
                                            {panes.length > 1 ? <Icon type='close' onClick={() => this.panesDelete(pane.key)} /> : ''}
                                        </Col>)
                                    }
                            </Row>
                            <div style={{ float: 'right', fontSize: '14px'}}>
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
                                        {/*<Menu.Item>*/}
                                        {/*    <a style={{ fontSize: '14px', color: '#1890FF' }} onClick={() => {*/}
                                        {/*        this.props.router.push(`/personal`);*/}
                                        {/*    }}>个人设置</a>*/}
                                        {/*</Menu.Item>*/}
                                        <Menu.Item>
                                            <a style={{ fontSize: '14px', color: '#1890FF' }} onClick={() => {
                                                this.props.data.appState.panes = [];
                                                this.props.history.push(`/management/user/logout`);
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
                        </Layout.Content>
                    </Layout>
                </Layout>
            </div>
        );
    }
}

export const LayoutBase = withRouter(withAuth(withAppState(LayoutBaseView)));
