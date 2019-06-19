import { ColumnProps } from 'antd/lib/table/interface';
import { Tabs } from 'common/antd/tabs';
import { SearchTable, TableList } from 'common/component/searchTable';
import { ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { Radium } from 'common/radium';
import * as $ from 'jquery';
import * as _ from 'lodash';
import { toJS } from 'mobx';
import * as React from 'react';

@Radium
export class List extends React.Component<{}, {}> {
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
                        title: '角色名',
                        width: '15%',
                        dataIndex: 'role_name',
                    },
                    {
                        title: '描述',
                        width: '15%',
                        dataIndex: 'description',
                    },
                ],
                search: [
                    { itemProps: { label: '访问时间' }, key: 'rangePicker', type: 'rangePicker' },
                ],
            },
            {
                title: '贷中转化',
                url: '/api/wap/dc/drainage',
                columns: [
                    {
                        title: '角色名',
                        width: '15%',
                        dataIndex: 'role_name',
                    },
                    {
                        title: '描述',
                        width: '15%',
                        dataIndex: 'description',
                    },
                ],
                search: [
                    { itemProps: { label: '申请时间' }, key: 'rangePicker', type: 'rangePicker' },
                ],
            },
            {
                title: '放款统计',
                url: '/api/wap/dc/drainage',
                columns: [
                    {
                        title: '角色名',
                        width: '15%',
                        dataIndex: 'role_name',
                    },
                    {
                        title: '描述',
                        width: '15%',
                        dataIndex: 'description',
                    },
                ],
                search: [
                    { itemProps: { label: '房贷时间' }, key: 'rangePicker', type: 'rangePicker' },
                ],
            },
        ];
    }

    render() {
        return (
            <div style={{ padding: 24 }}>
                <Tabs onChange={this.callback} type='card'>
                    {
                        this.tabsData.map((r, i) => {
                            return (
                                <Tabs.TabPane tab={r.title} key={`${i}`}>
                                    <SearchTable
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

    private requestCallback = (data: any) => {
        console.log(data);
    }

    private callback = (key: string) => {
        console.log(key);
    }
}
