export interface NavProps {
    title: string;
    url: string;
    children?: NavProps[];
}

export const Nav: NavProps[] = [
    {
        title: '基础数据',
        url: 'saas/operatePlat',
        children: [
            {
                title: '域名管理',
                url: 'domain',
            },
            {
                title: '模型配置',
                url: 'rule',
            },
            {
                title: 'api日志',
                url: 'apilog',
            },
            {
                title: '支付管理',
                url: 'payManage',
            },
            {
                title: 'app管理',
                url: 'appConfig',
            },
            {
                title: '短信便签',
                url: 'messageList',
            },
            {
                title: '自动代扣',
                url: 'versionList',
            },
        ],
    },
];
