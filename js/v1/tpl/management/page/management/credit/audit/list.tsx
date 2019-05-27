import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Row } from 'common/antd/row';
import { Spin } from 'common/antd/spin';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
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
    @observable private editId: string = '';
    @observable private loading: boolean = false;
    @observable private amountWarn: string = '';
    @observable private amount: string = '';
    @observable private warnEdit: boolean = false;
    @observable private amountWarnValue: string = '';
    @observable private capitalId: string = '';
    @observable private withdrawBankList: any[] = [];
    @observable private rechargeVisible: boolean = false;
    @observable private rechargePayType: string|number = '';
    @observable private payTypeList: any[] = [];
    @observable private payMethodList: any[] = [];
    @observable private tradeStatusList: any[] = [];
    constructor(props: any) {
        super(props);
    }
    async componentDidMount() {
        const res: any = await mutate<{}, any>({
            url: '/api/admin/payment/orderselection',
            method: 'get',
        });
        if (res.status_code === 200) {
            const arr1 = [];
            const arr2 = [];
            const arr3 = [];
            for (const i of Object.keys(res.data.payType)) {
                arr1.push({label: res.data.payType[i], value: i});
            }
            this.payTypeList = arr1;
            for (const j of Object.keys(res.data.method)) {
                arr2.push({label: res.data.method[j], value: j});
            }
            arr2.unshift({label: '全部', value: '-1'});
            this.payMethodList = arr2;
            for (const k of Object.keys(res.data.tradeStatus)) {
                arr3.push({label: res.data.tradeStatus[k], value: k});
            }
            arr3.unshift({label: '全部', value: '-1'});
            this.tradeStatusList = arr3;
        }
    }
    beforeRequest(data: any) {
        const json: any = data;
        if (data.time) {
            json.startTime = data.time[0].format('YYYY-MM-DD');
            json.endTime = data.time[1].format('YYYY-MM-DD');
            delete json.time;
        }
        return json;
    }
    render() {
        const columns = [
            {title: '申请编号', key: 'id', dataIndex: 'id'},
            {title: '姓名', key: 'name', dataIndex: 'name'},
            {title: '手机号', key: 'phone', dataIndex: 'phone'},
            {title: '申请时间', key: 'amount', dataIndex: 'amount'},
            {title: '申请次数', key: 'apply_num', dataIndex: 'apply_num'},
            {title: '累计借款', key: 'loan_num', dataIndex: 'loan_num'},
            {title: '审核状态', key: 'apply_at_text', dataIndex: 'apply_at_text'},
            {title: '授信额度', key: 'credit_amount', dataIndex: 'credit_amount'},
            {title: '客户负责人', key: 'assign_name_text', dataIndex: 'assign_name_text'},
            {title: '渠道名称', key: 'charge_code', dataIndex: 'charge_code'},
        ];
        const search: BaseFormItem[] = [
            { itemProps: { label: '申请编号' }, key: 'apply_id', type: 'input' },
            { itemProps: { label: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '客户手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '申请时间' }, key: 'apply_date', type: 'rangePicker' },
            { itemProps: { label: '审核状态' }, key: 'audit_status', type: 'select' },
            // { itemProps: { label: '机审结果' }, key: 'time', type: 'select' },
            { itemProps: { label: '风控建议' }, key: 'recommend', type: 'select' },
            { itemProps: { label: '风险评级' }, key: 'rating', type: 'select' },
            { itemProps: { label: '模型分数' }, key: 'score', type: 'between' },
            // { itemProps: { label: '提现状态' }, key: 'time', type: 'select' },
            { itemProps: { label: '渠道名称' }, key: 'channel_id', type: 'select' },
            { itemProps: { label: '申请次数' }, key: 'apply_num', type: 'between' },
            { itemProps: { label: '累计借款次数' }, key: 'loan_num', type: 'between' },
            { itemProps: { label: '分配状态' }, key: 'assign_status', type: 'select' },
            { itemProps: { label: '客户负责人' }, key: 'assign_name', type: 'input' },
            { itemProps: { label: '身份证号' }, key: 'idcard_number', type: 'input' },
        ];
        const component = (
            <div>
                <SearchTable
                    ref={(ref) => {
                        this.tableRef = ref;
                    }}
                    query={{ search }}
                    requestUrl='/api/admin/apply/lists'
                    tableProps={{columns}}
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
                </Title> } />
            </Switch>
        );
    }
}
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;
