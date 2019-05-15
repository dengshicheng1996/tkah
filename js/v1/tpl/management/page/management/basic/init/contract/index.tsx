import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import TableComponent from '../../../../../common/TableComponent';
import Title from '../../../../../common/TitleComponent';
const Option = Select.Option;
@observer
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
            { title: '操作', dataIndex: 'productName7', render(data: any) {
                return (<div>
                            <a>编辑合同</a>
                            <a>删除</a>
                        </div>);
                } },
        ];
        return (
                <TableComponent search={[]} requestUrl={'admin/basicconfig/contractconfig/'} columns={columns}/>
        );
    }

}
