import { ColumnProps } from 'antd/lib/table/interface';
import { Tabs } from 'common/antd/tabs';
import { Request } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { Radium } from 'common/radium';
import * as $ from 'jquery';
import * as _ from 'lodash';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

@Radium
class ListView extends React.Component<RouteComponentProps<any>, {}> {
    private tableRef: TableList[] = [];
    private tabsData: Array<{
        title: string;
        url: string;
        columns: Array<ColumnProps<any>>;
        search?: Array<TypeFormItem | ComponentFormItem>;
    }> = [];

    constructor(props: any) {
        super(props);
        this.setTabsData();
    }

    setTabsData() {
        this.tabsData = [
            {
                title: '引流转化',
                url: '/api/wap/dc/drainage',
                columns: [
                    {
                        title: '日期',
                        width: '25%',
                        key: 'time_column',
                        dataIndex: 'time',
                    },
                    {
                        title: '客户总数',
                        width: '25%',
                        key: 'total_column',
                        dataIndex: 'total',
                        render: (value: any, record: any) => {
                            return `${value}（${record.total_percentage}）`;
                        },
                    },
                    {
                        title: '新客户注册成功数',
                        width: '25%',
                        key: 'news_column',
                        dataIndex: 'news',
                        render: (value: any, record: any) => {
                            return `${value}（${record.news_percentage}）`;
                        },
                    },
                    {
                        title: '老客户访问数',
                        width: '25%',
                        key: 'old_column',
                        dataIndex: 'old',
                        render: (value: any, record: any) => {
                            return `${value}（${record.old_percentage}）`;
                        },
                    },
                ],
                search: [
                    { itemProps: { label: '访问时间' }, key: 'rangePicker', type: 'rangePicker' },
                ],
            },
            {
                title: '贷中转化',
                url: '/api/wap/dc/apply',
                columns: [
                    {
                        title: '日期',
                        width: '25%',
                        key: 'time_column',
                        dataIndex: 'time',
                    },
                    {
                        title: '总申请数',
                        width: '25%',
                        key: 'total_column',
                        dataIndex: 'total',
                        render: (value: any, record: any) => {
                            return `${value}（${record.total_percentage}）`;
                        },
                    },
                    {
                        title: '首次申请提交数',
                        width: '25%',
                        key: 'first_column',
                        dataIndex: 'first',
                        render: (value: any, record: any) => {
                            return `${value}（${record.first_percentage}）`;
                        },
                    },
                    {
                        title: '非首次申请提交数',
                        width: '25%',
                        key: 'not_first_column',
                        dataIndex: 'not_first',
                        render: (value: any, record: any) => {
                            return `${value}（${record.not_first_percentage}）`;
                        },
                    },
                ],
                search: [
                    { itemProps: { label: '申请时间' }, key: 'rangePicker', type: 'rangePicker' },
                ],
            },
            {
                title: '放款统计',
                url: '/api/wap/dc/loanorder',
                columns: [
                    {
                        title: '日期',
                        width: '10%',
                        key: 'time',
                        dataIndex: 'time',
                    },
                    {
                        title: '总放款订单数',
                        width: '15%',
                        key: 'loan_total',
                        dataIndex: 'total',
                        render: (value: any, record: any) => {
                            return `${value}（${record.total_percentage}）`;
                        },
                    },
                    {
                        title: '首借放款订单数',
                        width: '15%',
                        key: 'first_loan_total',
                        dataIndex: 'first',
                        render: (value: any, record: any) => {
                            return `${value}（${record.first_percentage}）`;
                        },
                    },
                    {
                        title: '续借放款订单数',
                        width: '15%',
                        key: 'not_first_loan_total',
                        dataIndex: 'not_first',
                        render: (value: any, record: any) => {
                            return `${value}（${record.not_first_percentage}）`;
                        },
                    },
                    {
                        title: '总放款金额',
                        width: '15%',
                        key: 'amount_total',
                        dataIndex: 'amount_total',
                        render: (value: any, record: any) => {
                            return `${value}（${record.amount_total_percentage}）`;
                        },
                    },
                    {
                        title: '首借放款金额',
                        width: '15%',
                        key: 'first_amount_total',
                        dataIndex: 'amount_first_total',
                        render: (value: any, record: any) => {
                            return `${value}（${record.amount_first_total_percentage}）`;
                        },
                    },
                    {
                        title: '续借放款金额',
                        width: '15%',
                        key: 'not_first_amount_total',
                        dataIndex: 'amount_not_first_total',
                        render: (value: any, record: any) => {
                            return `${value}（${record.amount_not_first_total_percentage}）`;
                        },
                    },
                ],
                search: [
                    { itemProps: { label: '放贷时间' }, key: 'rangePicker', type: 'rangePicker' },
                ],
            },
        ];
    }

    render() {
        return (
            <div style={{ padding: 24 }}>
                <Tabs type='card'>
                    {
                        this.tabsData.map((r, i) => {
                            return (
                                <Tabs.TabPane tab={r.title} key={`${i}`}>
                                    <SearchTable
                                        listKey='statistic'
                                        wrappedComponentRef={(ref: TableList) => { this.tableRef[i] = ref; }}
                                        requestUrl={r.url}
                                        requestCallback={this.requestCallback}
                                        tableProps={{ columns: r.columns }}
                                        query={{ search: r.search }}
                                        beforeRequest={(data) => this.beforeRequest(data)}
                                    />
                                </Tabs.TabPane>
                            );
                        })
                    }
                </Tabs>
            </div>
        );
    }

    private beforeRequest = (data: any) => {
        const json: any = data;
        json['channel_id'] = $.cookie('channelId');
        json['password'] = $.cookie('password');

        if (data.rangePicker && data.rangePicker.length > 0) {
            json.start_date = data.rangePicker[0].format('YYYY-MM-DD');
            json.end_date = data.rangePicker[1].format('YYYY-MM-DD');
            delete json.rangePicker;
        }

        return json;
    }

    private requestCallback = (data: any, req: Request<any>) => {
        if (data.status_code !== 200) {
            this.props.history.push(`/statistics/user/logout`);
            return [];
        }
        const index = _.findIndex(this.tabsData, (r) => r.url === req.url);
        const json: any = {};
        this.tabsData[index].columns.forEach((r) => {
            if (data.data.total) {
                if (data.data.total[r.key] !== undefined) {
                    json[r.dataIndex] = data.data.total[r.key];
                    json[`${r.dataIndex}_percentage`] = data.data.total[`${r.key}_percentage`];
                } else {
                    json[r.dataIndex] = '总计';
                }
            }
        });
        data.data.statistic.unshift(json);
        return data.data;
    }
}

export const List = withRouter(ListView);
