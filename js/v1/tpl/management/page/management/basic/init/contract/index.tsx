import { SearchTable } from 'common/component/searchTable';
import * as React from 'react';

export default class Product extends React.Component<{}, any> {

    constructor(props: any) {
        super(props);
    }
    render() {
        const columns = [
            { title: '合同编号', dataIndex: 'name' },
            { title: '合同名称', dataIndex: 'productName2' },
            { title: '合同类型', dataIndex: 'productName3' },
            { title: '创建时间', dataIndex: 'productName4' },
            {
                title: '操作', dataIndex: 'productName7', render(data: any) {
                    return (<div>
                        <a>编辑合同</a>
                        <a>删除</a>
                    </div>);
                },
            },
        ];
        return (
            <SearchTable
                requestUrl={'admin/basicconfig/contractconfig/'}
                tableProps={{ columns }} />
        );
    }

}
