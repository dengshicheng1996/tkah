import { ColumnProps } from 'antd/lib/table/interface';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import * as React from 'react';
import { TableInfo } from './table';

@Radium
export class List extends React.Component<{}, {}> {
    private columns: Array<ColumnProps<any>>;

    constructor(props: any) {
        super(props);
        this.setColumns();
    }

    setColumns() {
        this.columns = [
            {
                title: '角色名',
                width: '15%',
                dataIndex: 'role_name',
            },
            {
                title: '描述',
                width: '15%',
                dataIndex: 'description',
            },
        ];
    }

    render() {
        return (
            <div style={{ padding: 24 }}>
                <TableInfo url='/api/crm/roles' columns={this.columns} />
            </div>
        );
    }
}
