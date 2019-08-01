import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { Between } from 'common/formTpl/modules/between';
import {getSearch, getUrlSearch, setSearch} from 'common/tools';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {
    Route,
    Switch,
} from 'react-router-dom';
import {withAppState} from '../../../../common/appStateStore';
import Title from '../../../../common/TitleComponent';
import Reject from './reject';
@observer
class Account extends React.Component<any, any> {
    private tableRef: TableList;
    @observable private visible: boolean = false;
    @observable private loading: boolean = false;
    @observable private selectedRows: any[] = [];
    @observable private applyIds: number[] = [];
    @observable private risk_rating: any[] = [];
    @observable private withdraw: any[] = [];
    @observable private channel: any[] = [];
    @observable private assign: any[] = [];
    @observable private risk_level: any[] = [];
    @observable private risk_suggest: any[] = [];
    @observable private review: any[] = [];
    @observable private rejectVisible: boolean = false;
    constructor(props: any) {
        super(props);
    }
    // admin/apply/search
    async componentDidMount() {
        this.loading = true;
        const res: any = await mutate<{}, any>({
            url: '/api/admin/apply/search',
            method: 'get',
        });
        this.loading = false;
        this.withdraw = [{label: '全部', value: '-1'}].concat(res.data.withdraw);
        this.channel = [{label: '全部', value: '-1'}].concat(res.data.channel);
        this.assign = [{label: '全部', value: '-1'}].concat(res.data.assign);
        this.review = [{label: '全部', value: '-1'}].concat(res.data.review);
        this.risk_rating = [{label: '全部', value: '-1'}].concat(res.data.risk_rating);
        this.risk_suggest = [{label: '全部', value: '-1'}].concat(res.data.risk_suggest);
        this.risk_level = [{label: '全部', value: '-1'}].concat(res.data.risk_level);
    }
    beforeRequest(data: any) {
        const json: any = data;
        setSearch(this.props.data.appState.panes, this.props.data.appState.activePane, JSON.parse(JSON.stringify(data)));
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
    async batchReject(values: any) {
        const json = Object.assign(values, {apply_ids: this.applyIds});
        const res: any = await mutate<{}, any>({
            url: '/api/admin/apply/batchreject',
            method: 'post',
            variables: json,
        }).catch((error: any) => {
            Modal.error({
                title: '警告',
                content: `Error: ${JSON.stringify(error)}`,
            });
            return {};
        });
        if (res.status_code === 200) {
            this.rejectVisible = false;
            this.tableRef.getQuery().refresh();
            this.selectedRows = [];
            Modal.success({
                title: '提示',
                content: `状态为审核中的申请已经成功拒绝，已经审核完成的申请不会更改状态`,
            });
        } else {
            message.error(res.message);
        }
        return new Promise((reslove) => reslove());
    }
    render() {
        const jurisdiction: number[] = this.props.data.appState.jurisdiction || [];
        const columns = [
            { title: '申请编号', key: 'apply_no', dataIndex: 'apply_no' },
            { title: '姓名', key: 'customer_name', dataIndex: 'customer_name' },
            { title: '手机号', key: 'customer_phone', dataIndex: 'customer_phone' },
            { title: '申请时间', key: 'apply_at_text', dataIndex: 'apply_at_text' },
            { title: '申请次数', key: 'times', dataIndex: 'times', render: (num: number | string) => '第' + num + '次' },
            { title: '累计借款', key: 'loan_num', dataIndex: 'loan_num', render: (num: number | string) =>  num + '次' },
            { title: '审核状态', key: 'apply_status_text', dataIndex: 'apply_status_text' },
            { title: '授信额度', key: 'credit_amount', dataIndex: 'credit_amount' },
            { title: '客户负责人', key: 'assign_name_text', dataIndex: 'assign_name_text', render: (num: number | string) =>  '未分配' },
            { title: '渠道名称', key: 'channel_name', dataIndex: 'channel_name' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '申请编号' }, key: 'apply_no', type: 'input' },
            { itemProps: { label: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '客户手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '申请时间' }, key: 'apply_date', type: 'rangePicker' },
            { itemProps: { label: '审核状态' }, initialValue: '-1', key: 'audit_status', type: 'select', options: this.review },
            { itemProps: { label: '机审结果' }, initialValue: '-1', key: 'suggest', type: 'select', options: this.risk_suggest },
            { itemProps: { label: '风控建议' }, initialValue: '-1', key: 'risk_level', type: 'select', options: this.risk_level },
            { itemProps: { label: '风险评级' }, initialValue: '-1', key: 'rating', type: 'select', options: this.risk_rating },
            { itemProps: { label: '模型分数' }, key: 'score', component: <Between /> },
            { itemProps: { label: '提现状态' }, key: 'withdraw', type: 'select', options: this.withdraw },
            { itemProps: { label: '渠道名称' }, initialValue: '-1', key: 'channel_id', type: 'select', options: this.channel },
            { itemProps: { label: '申请次数' }, key: 'apply_num', component: <Between /> },
            { itemProps: { label: '累计借款次数' }, key: 'loan_num', component: <Between /> },
            { itemProps: { label: '分配状态' }, initialValue: '-1', key: 'assign_status', type: 'select', options: this.assign },
            { itemProps: { label: '客户负责人' }, key: 'assign_name', type: 'input' },
            { itemProps: { label: '身份证号' }, key: 'idcard_number', type: 'input' },
        ];
        const onSelectChange = (selectedRowKeys: number[], data: any[]) => {
            this.selectedRows = selectedRowKeys;
            const arr: number[] = [];
            data.map((item: any) => {
                arr.push(item.id);
            });
            this.applyIds = arr;
        };
        const rowSelection = {
            selectedRowKeys: this.selectedRows,
            onChange: onSelectChange,
        };
        const component = (
            this.loading ? <Spin/> :
            <div>
                <Reject
                    rejectVisible={this.rejectVisible}
                    rejectCancel={() => this.rejectVisible = false}
                    onOk={(values: any) => this.batchReject(values)}
                />
                <SearchTable
                    autoSearch={Object.assign(getUrlSearch(), getSearch(this.props.data.appState.panes, this.props.data.appState.activePane))}
                    wrappedComponentRef={(ref: TableList) => { this.tableRef = ref; }}
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
                        rowSelection,
                    }}
                    otherComponent={
                        <div>
                            {/*<Button disabled={this.selectedRows.length === 0} style={{marginRight: 20}} type={'primary'}>分配客户负责人</Button>*/}
                            {
                                jurisdiction.indexOf(41) ? <Button disabled={this.selectedRows.length === 0} type={'primary'} onClick={() => this.rejectVisible = true}>批量拒绝</Button> : null
                            }
                        </div>
                    }
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
const ExportViewCom: any = Form.create()(Account);
export default withAppState(ExportViewCom);
