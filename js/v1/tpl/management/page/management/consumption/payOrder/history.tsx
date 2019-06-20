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
    @observable private rechargePayType: string | number = '';
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
                arr1.push({ label: res.data.payType[i], value: i });
            }
            this.payTypeList = arr1;
            for (const j of Object.keys(res.data.method)) {
                arr2.push({ label: res.data.method[j], value: j });
            }
            arr2.unshift({ label: '全部', value: '-1' });
            this.payMethodList = arr2;
            for (const k of Object.keys(res.data.tradeStatus)) {
                arr3.push({ label: res.data.tradeStatus[k], value: k });
            }
            arr3.unshift({ label: '全部', value: '-1' });
            this.tradeStatusList = arr3;
        }
    }
    beforeRequest(data: any) {
        const json: any = data;
        if (data.time && data.time.length > 0) {
            json.startTime = data.time[0].format('YYYY-MM-DD');
            json.endTime = data.time[1].format('YYYY-MM-DD');
            delete json.time;
        }
        return json;
    }
    render() {
        const columns = [
            { title: '操作时间', key: 'created_at', dataIndex: 'created_at' },
            { title: '订单号', key: 'trade_no', dataIndex: 'trade_no' },
            { title: '交易类型', key: 'pay_method_text', dataIndex: 'pay_method_text' },
            { title: '金额', key: 'amount', dataIndex: 'amount' },
            { title: '支付通道', key: 'pay_type_text', dataIndex: 'pay_type_text' },
            { title: '交易账户', key: 'bank_num', render: (data) => {return data.customer_name + '+' + data.bank_num} },
            { title: '状态', key: 'trade_status_text', dataIndex: 'trade_status_text' },
            { title: '充值码', key: 'charge_code', dataIndex: 'charge_code' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '时间' }, key: 'time', type: 'rangePicker' },
            {
                itemProps: { label: '支付通道' }, initialValue: this.props.match.params.payType, key: 'payType', type: 'select', options: this.payTypeList,
            },
            { itemProps: { label: '交易账户' }, key: 'bankCard', type: 'input' },
            {
                itemProps: { label: '交易类型' }, key: 'payMethod', type: 'select', options: this.payMethodList,
            },
            {
                itemProps: { label: '状态' }, key: 'tradeStatus', type: 'select', options: this.tradeStatusList,
            },
        ];
        const component = (
            <div>
                <SearchTable
                    ref={(ref) => {
                        this.tableRef = ref;
                    }}
                    query={{ search }}
                    requestUrl='/api/admin/payment/orderlists'
                    tableProps={{ columns }}
                    listKey={'data'}
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
