import { Form } from 'common/antd/form';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import {getSearch, objectToOption} from 'common/tools';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import {withAppState} from '../../../../common/appStateStore';
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
    @observable private typeList: any[] = [];
    constructor(props: any) {
        super(props);
    }
    async componentDidMount() {
        const res: any = await mutate<{}, any>({
            url: '/api/admin/payment/section',
            method: 'get',
        });
        if (res.status_code === 200) {
            this.payTypeList = objectToOption(res.data.payType);
            this.typeList = [{label: '全部', value: '-1'}].concat(objectToOption(res.data.type));
        }
    }
    beforeRequest(data: any) {
        const json: any = data;
        if (data.time && data.time.length > 0) {
            json.start_time = data.time[0].format('YYYY-MM-DD');
            json.end_time = data.time[1].format('YYYY-MM-DD');
            delete json.time;
        }
        return json;
    }
    render() {
        const columns = [
            { title: '时间', key: 'created_at', dataIndex: 'created_at' },
            { title: '贷款编号', key: 'loan_no', dataIndex: 'loan_no' },
            { title: '账务类型', key: 'type_text', dataIndex: 'type_text' },
            { title: '收支金额', key: 'amount', dataIndex: 'amount' },
            { title: '账户余额', key: 'balance', dataIndex: 'balance' },
            { title: '支付通道', key: 'pay_type_text', dataIndex: 'pay_type_text' },
            { title: '交易账户', key: 'bank_card_num', render: (data: any) => {
                if (data.name !== '-' && data.bank_card_num !== '-') {
                    return data.name + '+' + data.bank_card_num;
                } else if (data.bank_card_num !== '-') {
                    return data.bank_card_num;
                }
            } },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '时间' }, key: 'time', type: 'rangePicker' },
            {
                itemProps: { label: '支付通道' }, initialValue: this.props.match.params.payType, key: 'pay_type', type: 'select', options: this.payTypeList,
            },
            { itemProps: { label: '交易账户' }, key: 'bank_card', type: 'input' },
            {
                itemProps: { label: '账务类型' }, key: 'type', type: 'select', options: this.typeList,
            },
            { itemProps: { label: '贷款编号' }, key: 'loan_no', type: 'input' },
        ];
        const component = (
            <div>
                <SearchTable
                    ref={(ref) => {
                        this.tableRef = ref;
                    }}
                    query={{ search }}
                    requestUrl='/api/admin/payment/transactions'
                    autoSearch={getSearch(this.props.data.appState.panes, this.props.data.appState.activePane)}
                    tableProps={{ columns }}
                    method={'get'}
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
const ExportViewCom: any = Form.create()(Account);
export default withAppState(ExportViewCom);
