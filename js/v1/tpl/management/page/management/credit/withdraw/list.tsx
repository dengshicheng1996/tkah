import { Button } from 'common/antd/button';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Row } from 'common/antd/row';
import { Spin } from 'common/antd/spin';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { Between } from 'common/formTpl/modules/between';
import {objectToOption} from 'common/tools';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import Title from '../../../../common/TitleComponent';

@observer
class Account extends React.Component<any, any> {
    private tableRef: TableList;
    @observable private visible: boolean = false;
    @observable private selectedRows: any[] = [];
    @observable private risk_rating: any[] = [];
    @observable private withdraw: any[] = [];
    @observable private channel: any[] = [];
    @observable private assign: any[] = [];
    @observable private risk_review: any[] = [];
    @observable private review: any[] = [];
    constructor(props: any) {
        super(props);
    }
    // admin/apply/search
    async componentDidMount() {
        const res: any = await mutate<{}, any>({
            url: '/api/admin/basicconfig/searchchannel',
            method: 'get',
        });
        this.channel = [{label: '全部', value: '-1'}].concat(objectToOption(res.data));
    }
    beforeRequest(data: any) {
        const json: any = data;
        if (data.time) {
            json.start_loan_date = data.time[0].format('YYYY-MM-DD');
            json.end_loan_date = data.time[1].format('YYYY-MM-DD');
            delete json.apply_date;
        }
        if (data.loan_num) {
            const arr = data.loan_num;
            arr[0] === '' ? delete json.start_loan_num : json.start_loan_num = arr[0];
            arr[1] !== '' ? json.end_loan_num = arr[1] : delete json.end_loan_num;
            delete json.loan_num;
        }
        return json;
    }
    render() {
        const columns = [
            { title: '订单编号', key: 'id', dataIndex: 'id' },
            { title: '姓名', key: 'customer_name', dataIndex: 'customer_name' },
            { title: '手机号', key: 'customer_phone', dataIndex: 'customer_phone' },
            { title: '提现时间', key: 'created_at', dataIndex: 'created_at' },
            { title: '订单金额', key: 'loan_amount', dataIndex: 'loan_amount' },
            { title: '合同签署状态', key: 'contract_status', dataIndex: 'contract_status', render: (num: number | string) => num },
            { title: '放款状态', key: 'loan_status', dataIndex: 'loan_status', render: (num: number | string) => num },
            { title: '借款次数', key: 'loan_num', dataIndex: 'loan_num', render: (num: number | string) => '第' + num + '次' },
            { title: '客户负责人', key: 'assign_name_text', dataIndex: 'assign_name_text' },
            { title: '渠道名称', key: 'channel_name', dataIndex: 'channel_name' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '订单编号' }, key: 'apply_id', type: 'input' },
            { itemProps: { label: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '客户手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '提现时间' }, key: 'time', type: 'rangePicker' },
            { itemProps: { label: '合同签署状态' }, key: 'contract_status', type: 'select',
                options: [
                    {label: '全部', value: '-1'},
                    {label: '签署中', value: '1'},
                    {label: '签署成功', value: '2'},
                    {label: '签署失败', value: '3'},
                    {label: '不需要签署', value: '4'},
                ]},
            { itemProps: { label: '放款状态' }, key: 'loan_status', type: 'select', options: [
                    {label: '全部', value: '-1'},
                    {label: '订单产生(未放款)', value: '1'},
                    {label: '放款中', value: '2'},
                    {label: '放款完成', value: '3'},
                    {label: '取消放款', value: '4'},
                    {label: '放款异常', value: '5'},
                ]},
            { itemProps: { label: '渠道名称' }, key: 'channel_id', type: 'select', options: this.channel },
            { itemProps: { label: '借款次数' }, key: 'loan_num', component: <Between /> },
            { itemProps: { label: '分配状态' }, key: 'time', type: 'select', options: this.withdraw },
            // { itemProps: { label: '客户负责人' }, key: 'assign_name', type: 'input' },
        ];
        // const rowSelection = {
        //     onSelect: (record: any, selected: any, selectedRows: any) => {
        //         if (selected) {
        //             this.selectedRows.push(record.id);
        //         } else {
        //             this.selectedRows.splice(this.selectedRows.indexOf(record.id), 1);
        //         }
        //     },
        // };
        const component = (
            <div>
                <SearchTable
                    ref={(ref) => {
                        this.tableRef = ref;
                    }}
                    query={{ search }}
                    requestUrl='/api/admin/order/lists'
                    tableProps={{
                        columns,
                        onRow: (r) => {
                            return {
                                onClick: (event: any) => {
                                    this.props.history.push('/management/credit/withdraw/' + r.id);
                                },
                            };
                        },
                        // rowSelection,
                    }}
                    // otherComponent={
                    //     <div>
                    //         <Button disabled={this.selectedRows.length === 0} style={{marginRight: 20}} type={'primary'}>分配客户负责人</Button>
                    //         <Button disabled={this.selectedRows.length === 0} type={'primary'}>批量拒绝</Button>
                    //     </div>
                    // }
                    beforeRequest={(data) => this.beforeRequest(data)}
                />
            </div>
        );
        return (
            <Switch>
                <Route render={() => <Title>
                    {
                        component
                    }
                </Title>} />
            </Switch>
        );
    }
}
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;
