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
            url: '/api/admin/apply/search',
            method: 'get',
        });
        this.risk_rating = res.data.risk_rating;
        this.withdraw = res.data.withdraw;
        this.channel = res.data.channel;
        this.assign = res.data.assign;
        this.risk_review = res.data.risk_review;
        this.review = res.data.review;
    }
    beforeRequest(data: any) {
        const json: any = data;
        if (data.apply_date && data.apply_date.length > 0) {
            json.start_apply_date = data.apply_date[0].format('YYYY-MM-DD');
            json.end_apply_date = data.apply_date[1].format('YYYY-MM-DD');
            delete json.apply_date;
        }
        if (data.loan_num) {
            const arr = data.loan_num;
            arr[0] === '' ? delete json.start_loan_num : json.start_loan_num = arr[0];
            arr[1] !== '' ? json.end_loan_num = arr[1] : delete json.end_loan_num;
            delete json.loan_num;
        }
        if (data.score) {
            const arr = data.score;
            arr[0] !== '' ? json.start_score = arr[0] : delete json.start_score;
            arr[1] !== '' ? json.end_score = arr[1] : delete json.end_score;
            delete json.score;
        }
        if (data.apply_num) {
            const arr = data.apply_num;
            arr[0] !== '' ? json.start_apply_num = arr[0] : delete json.start_apply_num;
            arr[1] !== '' ? json.end_apply_num = arr[1] : delete json.end_apply_num;
            delete json.apply_num;
        }
        return json;
    }
    render() {
        const columns = [
            { title: '申请编号', key: 'id', dataIndex: 'id' },
            { title: '姓名', key: 'customer_name', dataIndex: 'customer_name' },
            { title: '手机号', key: 'customer_phone', dataIndex: 'customer_phone' },
            { title: '申请时间', key: 'apply_at_text', dataIndex: 'apply_at_text' },
            { title: '申请次数', key: 'apply_num', dataIndex: 'apply_num', render: (num: number | string) => '第' + num + '次' },
            { title: '累计借款', key: 'loan_num', dataIndex: 'loan_num', render: (num: number | string) =>  num + '次' },
            { title: '审核状态', key: 'apply_status_text', dataIndex: 'apply_status_text' },
            { title: '授信额度', key: 'credit_amount', dataIndex: 'credit_amount' },
            { title: '客户负责人', key: 'assign_name_text', dataIndex: 'assign_name_text' },
            { title: '渠道名称', key: 'channel_name', dataIndex: 'channel_name' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '申请编号' }, key: 'apply_id', type: 'input' },
            { itemProps: { label: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '客户手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '申请时间' }, key: 'apply_date', type: 'rangePicker' },
            { itemProps: { label: '审核状态' }, key: 'audit_status', type: 'select', options: this.review },
            { itemProps: { label: '机审结果' }, key: 'time', type: 'select', options: this.risk_review },
            { itemProps: { label: '风控建议' }, key: 'recommend', type: 'select', options: this.review },
            { itemProps: { label: '风险评级' }, key: 'rating', type: 'select', options: this.risk_rating },
            { itemProps: { label: '模型分数' }, key: 'score', component: <Between /> },
            { itemProps: { label: '提现状态' }, key: 'time', type: 'select', options: this.withdraw },
            { itemProps: { label: '渠道名称' }, key: 'channel_id', type: 'select', options: this.channel },
            { itemProps: { label: '申请次数' }, key: 'apply_num', component: <Between /> },
            { itemProps: { label: '累计借款次数' }, key: 'loan_num', component: <Between /> },
            { itemProps: { label: '分配状态' }, key: 'assign_status', type: 'select', options: this.assign },
            { itemProps: { label: '客户负责人' }, key: 'assign_name', type: 'input' },
            { itemProps: { label: '身份证号' }, key: 'idcard_number', type: 'input' },
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
                    requestUrl='/api/admin/apply/lists'
                    tableProps={{
                        columns,
                        onRow: (r) => {
                            return {
                                onClick: (event: any) => {
                                    this.props.history.push('/management/credit/audit/' + r.id);
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
