import * as DataSet from '@antv/data-set';
import { Axis, Chart, Geom, Legend, Tooltip as TooltipBox } from 'bizcharts';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import {objectToOption} from 'common/tools';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as moment from 'moment';
import * as React from 'react';
import {withAppState} from '../../../../common/appStateStore';
import Title from '../../../../common/TitleComponent';
const Tooltip: any = TooltipBox;
interface IndexProps {
    form: any;
}
interface IndexState {
    option: any[];
    num: any[];
    proportion: any[];
    productList: any[];
    channelList: any[];
    status: string;
}
@observer
class IndexComponent extends React.Component<IndexProps, IndexState> {
    dv: any;
    private tableRef: TableList;
    @observable private channel: any[] = [];
    @observable private proportion: any[] = [];
    @observable private num: any[] = [];
    constructor(props: any) {
        super(props);
    }
    beforeRequest(data: any) { // end
        const json: any = data;
        if (data.time && data.time.length > 0) {
            json.start_dt = data.time[0].format('YYYY-MM-DD');
            json.end_dt = data.time[1].format('YYYY-MM-DD');
            delete json.time;
        }
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
        // @ts-ignore
        const { DataView } = DataSet;
        const proportion: any[] = this.proportion;
        const data: any[] = [];
        const time: any[] = [];
        proportion.map((item: any) => {
            const obj: any = {
                loanCompletionTime: '',
            };
            const arr: any[] = item.loanCompletionTime.split('-');
            const str = arr[1] + '/' + arr[2];
            time.push(str);
            obj.loanCompletionTime = str;
            obj['首逾'] = item.first_overdue_rate;
            obj['逾期2天'] = item.overdue_2_rate;
            obj['逾期3天'] = item.overdue_3_rate;
            obj['逾期>=7天'] = item.overdue_7_rate;
            obj['逾期>=14天'] = item.overdue_14_rate;
            obj['逾期>=30天'] = item.overdue_30_rate;
            obj['逾期>=60天'] = item.overdue_60_rate;
            data.push(obj);
        });
        this.dv =  new DataView();
        this.dv.source(data.reverse()).transform({
            type: 'fold',
            fields: ['首逾', '逾期2天', '逾期3天', '逾期>=7天', '逾期>=14天', '逾期>=30天', '逾期>=60天'],
            key: 'type',
            value: 'percentile', // value字段
        });
        const cols = {
            loanCompletionTime: {
                alias: '日期',
                range: [0, 0.95],
                ticks: time,
            },
            percentile: {
                alias: '百分比',
                ticks: [ 0, 20, 40, 60, 80, 100],
            },
        };
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '放款完成时间' }, typeComponentProps: {}, key: 'time',
                type: 'rangePicker',
                initialValue: [moment(new Date().getTime() - 15 * 24 * 3600 * 1000), moment(new Date().getTime() - 8 * 24 * 3600 * 1000)],
            },
            {
                itemProps: { label: '订单分类'}, key: 'loan_type', type: 'select',
                options: [
                    {label: '全部', value: '-1'},
                    {label: '首借订单', value: 1},
                    {label: '续借订单', value: 7},
                ],
                initialValue: '-1',
            },
            {
                itemProps: { label: '渠道搜索'}, key: 'channel', type: 'select', options: this.channel,
                initialValue: '-1',
            },
        ];
        const columns = [
            { title: '放款日期', key: 'title', dataIndex: 'title' },
            { title: '放款日期', key: 'loan_order_num', dataIndex: 'loan_order_num' },
            { title: '首逾订单数', key: 'first_overdue', dataIndex: 'first_overdue', render: (overdue: string|number, record: any) => `${overdue}(${record.first_overdue_rate})` },
            { title: '逾期>=2天', key: 'overdue_2', dataIndex: 'overdue_2', render: (overdue: string|number, record: any) => `${overdue}(${record.overdue_2_rate})` },
            { title: '逾期>=3天', key: 'overdue_3', dataIndex: 'overdue_3', render: (overdue: string|number, record: any) => `${overdue}(${record.overdue_3_rate})` },
            { title: '逾期>=7天', key: 'overdue_7', dataIndex: 'overdue_7', render: (overdue: string|number, record: any) => `${overdue}(${record.overdue_7_rate})` },
            { title: '逾期>=14天', key: 'overdue_14', dataIndex: 'overdue_14', render: (overdue: string|number, record: any) => `${overdue}(${record.overdue_14_rate})` },
            { title: '逾期>=30天', key: 'overdue_30', dataIndex: 'overdue_30', render: (overdue: string|number, record: any) => `${overdue}(${record.overdue_30_rate})` },
            { title: '逾期>=60', key: 'overdue_60', dataIndex: 'overdue_60', render: (overdue: string|number, record: any) => `${overdue}(${record.overdue_60_rate})` },
        ];
        const otherComponent = <div style={{padding: '14px', width: '100%', textAlign: 'center'}}>
            <div>
                <h2 style={{
                    width: '900px',
                    fontSize: '16px',
                    fontWeight: 700,
                    margin: 'auto',
                    textAlign: 'left',
                    paddingLeft: '70px',
                }}>每日逾期趋势</h2>
            </div>
            <Chart height={400} width={900} data={this.dv} scale={cols} filter={[['type', (t: string) => {
                if (t === '首逾') {
                    return true;
                }
                return false;
            }]]}>
                <Legend />
                <Axis name='loanCompletionTime' />
                <Axis title={{}} label={{
                    formatter: val => `${val}%`,
                }} name='percentile' />
                <Tooltip
                    showTitle={false}
                    itemTpl={'<li data-index={index} style=&quot;margin-bottom:4px;&quot;>'
                    + '<span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>'
                    + '{name}   :  {value}%'
                    + '</li>'}
                />
                <Geom
                    type='line'
                    position='loanCompletionTime*percentile'
                    size={2}
                    color={'type'}
                />
                <Geom
                    type='point'
                    position='loanCompletionTime*percentile'
                    size={4}
                    shape={'circle'}
                    color={'type'}
                    style={{
                        stroke: '#fff',
                        lineWidth: 1,
                    }}
                />
            </Chart>
        </div>;
        return (
            <Title>
                <div className=''>
                    <SearchTable
                        wrappedComponentRef={(ref: TableList) => { this.tableRef = ref; }}
                        requestUrl='/api/admin/transform/overduestatistics'
                        tableProps={{ columns, bordered: true, style: {textAlign: 'center'} }}
                        query={{ search }}
                        otherComponent={otherComponent}
                        beforeRequest={(json: any) => this.beforeRequest(json)}
                    />
                </div>
            </Title>
        );
    }
    private search() {
        const {channelList, productList} = this.state;
        const productOption = productList.map(item => {
            const value = item.productId;
            const label = item.productName;
            return {value, label};
        });
        const channelOption = channelList.map(item => {
            const value = item.channelId;
            const label = item.channelName;
            return {value, label};
        });
        productOption.unshift({value: '-1', label: '全部'});
        channelOption.unshift({value: '-1', label: '全部'});
        return [
            {type: 'select', options: channelOption, showSearch: true, key: 'channelId', name: '渠道搜索'},
            {type: 'select', options: productOption, showSearch: true, key: 'productId', name: '产品搜索'},
            {type: 'date',  key: 'date', name: '订单放款时间', startime: 'startTime', endtime: 'endTime'},
        ];
    }
    private column() {
        return [
            {title: '放款日期', dataIndex: 'loanCompletionTime', key: 'loanCompletionTime', rowKey: 'loanCompletionTime'},
            {title: '放款订单笔数', dataIndex: 'loan', key: 'loan', rowKey: 'loan'},
            {title: '首逾', dataIndex: 'firstOverdue', key: 'firstOverdue', rowKey: 'firstOverdue'},
            {title: '逾期2天', dataIndex: 'greaterThan2', key: 'greaterThan2', rowKey: 'greaterThan2'},
            {title: '逾期3天', dataIndex: 'greaterThan3', key: 'greaterThan3', rowKey: 'greaterThan3'},
            {title: '逾期>=7天', dataIndex: 'greaterThan7', key: 'greaterThan7', rowKey: 'greaterThan7'},
            {title: '逾期>=14天', dataIndex: 'greaterThan14', key: 'greaterThan14', rowKey: 'greaterThan14'},
            {title: '逾期>=30天', dataIndex: 'greaterThan30', key: 'greaterThan30', rowKey: 'greaterThan30'},
            {title: '逾期>=60天', dataIndex: 'greaterThan60', key: 'greaterThan60', rowKey: 'greaterThan60'},
        ];
    }
}
export default withAppState(IndexComponent);
