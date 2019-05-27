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
    constructor(props: any) {
        super(props);
    }
    async componentDidMount() {
        const json = {
            payType: this.props.match.params.payType,
        };
        const res: any = await mutate<{}, any>({
            url: '/api/admin/payment/rechargeinfo',
            method: 'post',
            variables: json,
        });
        if (res.status_code === 200) {
            const arr = [];
            for (const i of Object.keys(res.data.companyPayList)) {
                arr.push({label: res.data.companyPayList[i], value: i});
            }
            this.payTypeList = arr;
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
            {title: '时间', key: 'created_at', dataIndex: 'created_at'},
            {title: '订单号', key: 'id', dataIndex: 'id'},
            {title: '账务类型', key: 'type_text', dataIndex: 'type_text'},
            {title: '收支金额', key: 'amount', dataIndex: 'amount'},
            {title: '账户余额', key: 'balance', dataIndex: 'balance'},
            {title: '支付通道', key: 'pay_type_text', dataIndex: 'pay_type_text'},
            {title: '交易账户', key: 'bank_card_num', dataIndex: 'bank_card_num'},
            {title: '操作', key: 'query_charge', render: (data: any) => {
                return <div>
                            <Link to={'/management/consumption/payOrder/list'}>详情</Link>
                        </div>;
            }},
        ];
        const search: BaseFormItem[] = [
            { itemProps: { label: '时间' }, key: 'time', type: 'rangePicker' },
            { itemProps: { label: '支付通道' }, initialValue: this.props.match.params.payType, key: 'payType', type: 'select', options: this.payTypeList,
            },
            { itemProps: { label: '交易账户' }, key: 'bankCard', type: 'input' },
            {
                itemProps: { label: '账务类型' }, key: 'type', type: 'select', options: [
                    { label: '全部', value: '-1' },
                    { label: '启用', value: '1' },
                    { label: '禁用', value: '2' },
                ],
            },
            { itemProps: { label: '订单号' }, key: 'tradeNo', type: 'input' },
        ];
        const component = (
                <div>
                    <SearchTable
                        ref={(ref) => {
                            this.tableRef = ref;
                        }}
                        query={{ search }}
                        requestUrl='/api/admin/payment/transactions'
                        tableProps={{columns}}
                        method={'post'}
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
                </Title> } />
            </Switch>
        );
    }
}
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;