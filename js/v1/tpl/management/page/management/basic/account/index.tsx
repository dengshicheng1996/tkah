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
import TableComponent from '../../../../common/TableComponent';
import Title from '../../../../common/TitleComponent';
const Option = Select.Option;
@observer
export default class Product extends React.Component<{}, any> {
    @observable private limitFields: any[] = [{value: ''}];
    @observable private orderFields: any[] = [{dayValue: '', principalRatioValue: '', interestRatioValue: ''}];
    @observable private exhibitionFields: any = {exhibitionRatioValue: '', allow: '0', dayValue: ''};
    @observable private interestFields: any = {exhibitionRatioValue: '', allow: '0', dayValue: ''};
    @observable private chargeFields: any[] = [{nameValue: '', amountSelect: '', amountInput: '', paymentValue: ''}];
    constructor(props: any) {
        super(props);
    }
    add() {
        console.log(3322);
    }
    render() {
        const columns = [
            { title: '用户备注', dataIndex: 'productName1' },
            { title: '手机号', dataIndex: 'productName2' },
            { title: '角色名称', dataIndex: 'productName3' },
            { title: '状态', dataIndex: 'productName4' },
            { title: '创建时间', dataIndex: 'productName5' },
            { title: '操作', dataIndex: 'productName7', render(data: any) {
                return (<div>
                            <a>禁用</a>
                            <a>编辑</a>
                        </div>);
                } },
        ];
        const search = [
            { name: '用户备注', placeholder: '用户备注', key: 'name', type: 'string' },
            {
                name: '状态', key: 'status', type: 'select', options: [
                    { label: '全部', value: '-1' },
                    { label: '启用', value: '1' },
                    { label: '禁用', value: '2' },
                ],
            },
        ];
        return (
            <Title>
                <TableComponent search={search} requestUrl={'/admin/account/users'} otherButton={<Button type='primary'  onClick={() => this.add()}>新建账号</Button>} columns={columns}/>
            </Title>
        );
    }

}
