import { Form } from 'common/antd/form';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import {getSearch, objectToOption, setSearch} from 'common/tools';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as moment from 'moment';
import * as React from 'react';
import {withAppState} from '../../../../common/appStateStore';
import Title from '../../../../common/TitleComponent';

@observer
class Index extends React.Component<any, any> {
    private tableRef: TableList;
    @observable private channel: any[] = [];
    @observable private group_by: string = 'date';
    constructor(props: any) {
        super(props);
    }
    beforeRequest(data: any) { // end
        const json: any = data;
        setSearch(this.props.data.appState.panes, this.props.data.appState.activePane, Object.assign({}, data));
        if (data.time && data.time.length > 0) {
            json.start_dt = data.time[0].format('YYYY-MM-DD');
            json.end_dt = data.time[1].format('YYYY-MM-DD');
            delete json.time;
        }
        data.group_by = this.group_by;
        return json;
    }
    componentDidMount() {
        mutate<{}, any>({
            url: '/api/admin/basicconfig/searchchannel',
            method: 'get',
        }).then(r => {
            if (r.status_code === 200) {
                this.channel = [{label: '全部', value: '-1'}].concat(objectToOption(r.data));
            }
        });
    }

    render() {
        let columns: any[] = [];
        if (this.group_by === 'channel') {
            columns = [
                { title: '渠道名称', key: 'title', dataIndex: 'title' },
                { title: '推广页访问客户数与百分比', key: 'access_at', dataIndex: 'access_at', render: (data: string|number, record: any) => `${data}(${record.access_rate})` },
                { title: 'APP启动客户数与百分比', key: 'app_activation_at', dataIndex: 'app_activation_at', render: (data: string|number, record: any) => `${data}(${record.app_activation_rate})` },
                { title: '不符合进件要求客户数与百分比', key: 'no_requirement', dataIndex: 'no_requirement', render: (data: string|number, record: any) => `${data}(${record.no_requirement_rate})` },
                { title: '创建认证资料客户数与百分比', key: 'message_at', dataIndex: 'message_at', render: (data: string|number, record: any) => `${data}(${record.message_rate})` },
                { title: '提交申请客户数与百分比', key: 'apply_at', dataIndex: 'apply_at', render: (data: string|number, record: any) => `${data}(${record.apply_rate})` },
                { title: '申请通过客户数与百分比', key: 'apply_approved_at', dataIndex: 'apply_approved_at', render: (data: string|number, record: any) => `${data}(${record.apply_approved_rate})` },
                { title: '已提现订单客户数与百分比', key: 'new_order_at', dataIndex: 'new_order_at', render: (data: string|number, record: any) => `${data}(${record.new_order_rate})` },
                { title: '放款成功订单客户数与百分比', key: 'loan_success_at', dataIndex: 'loan_success_at', render: (data: string|number, record: any) => `${data}(${record.loan_success_rate})` },
            ];
        } else {
            columns = [
                { title: '访问时间', key: 'title', dataIndex: 'title' },
                { title: '推广页访问客户数', key: 'access_at', dataIndex: 'access_at' },
                { title: 'APP启动客户数', key: 'app_activation_at', dataIndex: 'app_activation_at' },
                { title: '不符合进件要求客户数', key: 'no_requirement', dataIndex: 'no_requirement' },
                { title: '创建认证资料客户数', key: 'message_at', dataIndex: 'message_at' },
                { title: '提交申请客户数', key: 'apply_at', dataIndex: 'apply_at' },
                { title: '申请通过客户数', key: 'apply_approved_at', dataIndex: 'apply_approved_at' },
                { title: '已提现订单客户数', key: 'new_order_at', dataIndex: 'new_order_at' },
                { title: '放款成功订单客户数', key: 'loan_success_at', dataIndex: 'loan_success_at' },
            ];
        }
        columns.map((item: any) => {
            item.align = 'center';
        });

        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '统计维度' }, typeComponentProps: { onChange: (data: any) => { this.group_by = data; this.tableRef.getList(); }, placeholder: '统计维度' }, key: 'group_by', type: 'select',
                options: [
                    {label: '按每日统计', value: 'date'},
                    {label: '按渠道统计', value: 'channel'},
                ],
                initialValue: 'date',
            },
            { itemProps: { label: '访问时间' }, typeComponentProps: { placeholder: '访问时间' }, key: 'time',
                type: 'rangePicker',
                initialValue: [moment(new Date().getTime() - 7 * 24 * 3600 * 1000), moment(new Date().getTime())],
            },
            {
                itemProps: { label: '截至统计日期', hasFeedback: false }, key: 'limit_day', type: 'select',
                options: [
                    {label: '访问当日', value: 1},
                    {label: '访问日7天内', value: 7},
                ],
                initialValue: 7,
            },
            {
                itemProps: { label: '渠道搜索', hasFeedback: false }, key: 'channel', type: 'select', options: this.channel,
                initialValue: '-1',
            },
        ];
        return (
            <Title>
                <SearchTable
                    wrappedComponentRef={(ref: TableList) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/transform/flowconversion'
                    tableProps={{ columns, bordered: true, style: {textAlign: 'center'} }}
                    query={{ search }}
                    autoSearch={getSearch(this.props.data.appState.panes, this.props.data.appState.activePane)}
                    beforeRequest={(data: any) => this.beforeRequest(data)}
                />
            </Title>
        );
    }
}
const ExportViewCom: any = Form.create()(Index);
export default withAppState(ExportViewCom);
