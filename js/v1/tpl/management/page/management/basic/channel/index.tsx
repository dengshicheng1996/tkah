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
    render() {
        const columns = [
            { title: '渠道名称', dataIndex: 'productName1' },
            { title: '推广地址', dataIndex: 'productName2' },
            { title: '查看数据地址', dataIndex: 'productName3' },
            { title: '查看数据密码', dataIndex: 'productName4' },
            { title: '审批流', dataIndex: 'productName5' },
            { title: '状态', dataIndex: 'productName6' },
            { title: '操作', dataIndex: 'productName7', render(data: any) {
                return (<div>
                            <a>禁用</a>
                            <a>编辑</a>
                            <a>刷新密码</a>
                        </div>);
                } },
        ];
        const search = [
            { name: '渠道名称', placeholder: '渠道名称', key: 'name', type: 'string' },
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
                <TableComponent search={search} requestUrl={''} columns={columns}/>
            </Title>
        );
    }

}
