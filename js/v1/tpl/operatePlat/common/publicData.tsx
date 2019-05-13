export interface NavProps {
    title: string;
    url: string;
    children?: NavProps[];
}

export const Nav: NavProps[] = [
    {
        title: '基础数据',
        url: 'operatePlat',
        children: [
            {
                title: '账户管理',
                url: 'account',
            },
            {
                title: '公司管理',
                url: 'company',
            },
        ],
    },
];
