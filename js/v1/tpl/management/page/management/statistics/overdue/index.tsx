import { TableProps } from 'antd/lib/table/interface';
import { Button } from 'common/antd/button';
import { message } from 'common/antd/message';
import { Table } from 'common/antd/table';
import { Tabs } from 'common/antd/tabs';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import {objectToOption} from 'common/tools';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import Title from '../../../../common/TitleComponent';

const { TabPane } = Tabs;
import * as DataSet from '@antv/data-set';
import { Axis, Chart, Geom, Legend, Tooltip as TooltipBox } from 'bizcharts';
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
    @observable private channel: any[] = [];
    @observable private proportion: any[] = [];
    @observable private num: any[] = [];
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        const endTime = new Date().getTime() / 1000 - 7 * 24 * 3600;
        const startTime = endTime - 7 * 24 * 3600;
        const product = {
            values: {},
            url: 'getProductList',
        };
        mutate<{}, any>({
            url: '/api/admin/basicconfig/searchchannel',
            method: 'get',
        }).then(r => {
            if (r.status_code === 200) {
                this.channel = objectToOption(r.data);
            }
        });
        this.searchFunction({startTime, endTime});
    }
    render() {
        const { DataView } = DataSet;
        const { proportion} = this.state;
        const data = [];
        const time = [];
        proportion.map(item => {
            const obj = {
                loanCompletionTime: '',
            };
            const arr = item.loanCompletionTime.split('-');
            const str = arr[1] + '/' + arr[2];
            time.push(str);
            obj.loanCompletionTime = str;
            obj['首逾'] = item.firstOverdue === '—' ? 0 : +item.firstOverdue.split('%')[0];
            obj['逾期2天'] = item.greaterThan2 === '—' ? 0 : +item.greaterThan2.split('%')[0];
            obj['逾期3天'] = item.greaterThan3 === '—' ? 0 : +item.greaterThan3.split('%')[0];
            obj['逾期>=7天'] = item.greaterThan7 === '—' ? 0 : +item.greaterThan7.split('%')[0];
            obj['逾期>=14天'] = item.greaterThan14 === '—' ? 0 : +item.greaterThan14.split('%')[0];
            obj['逾期>=30天'] = item.greaterThan30 === '—' ? 0 : +item.greaterThan30.split('%')[0];
            obj['逾期>=60天'] = item.greaterThan60 === '—' ? 0 : +item.greaterThan60.split('%')[0];
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
        const endTime = new Date().getTime() / 1000 - 7 * 24 * 3600;
        const startTime = endTime - 7 * 24 * 3600;
        return (
            <div className=''>
                {/*<Search search={this.search()} autoSearch={{startTime, endTime}} searchFunction={searchData => this.searchFunction(searchData)} />*/}
                <div style={{padding: '14px', width: '100%', textAlign: 'center'}}>
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
                    <Chart height={400} width={900} data={this.dv} scale={cols} filter={[['type', (t) => {
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
                </div>
                <Tabs>
                    <TabPane tab='按百分比统计' key={'1'}>
                        <Table dataSource={this.proportion} pagination={{pageSize: 40}} bordered columns={this.column()}/>
                    </TabPane>
                    <TabPane tab='按订单数统计' key={'2'}>
                        <Table dataSource={this.num} pagination={{pageSize: 40}} bordered columns={this.column()} />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
    searchFunction(data) {
        const startTime = parseInt(data.startTime);
        const endTime = parseInt(data.endTime);
        if (isNaN(startTime) || isNaN(endTime)) {
            return message.warning('请选择查询时间');
        }
        data.startTime = startTime;
        data.endTime = endTime;
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
export default IndexComponent;
