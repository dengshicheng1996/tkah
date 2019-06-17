export interface NavProps {
    title: string;
    url: string;
    children?: NavProps[];
}

export const Nav: NavProps[] = [
    {
        title: '基础数据',
        url: 'statistics',
        children: [
            {
                title: '贷超',
                url: 'dc',
            },
        ],
    },
];
