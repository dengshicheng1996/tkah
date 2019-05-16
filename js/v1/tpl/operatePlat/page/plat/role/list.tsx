import { ColumnProps } from 'antd/lib/table';
import { Button } from 'common/antd/button';
import { Col } from 'common/antd/col';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Popconfirm } from 'common/antd/popconfirm';
import { Row } from 'common/antd/row';
import { Table } from 'common/antd/table';
import { Tag } from 'common/antd/tag';
import { mutate, Querier } from 'common/component/restFull';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { withAppState, WithAppState } from 'operatePlat/common/appStateStore';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

@Radium
@observer
export class ListView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];
    private columns: Array<ColumnProps<any>>;

    @observable private loading: boolean = false;
    @observable private resultData: any;

    @observable private page: number = 1;
    @observable private size: number = 20;

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentWillMount() {
        this.setColumns();
    }

    componentDidMount() {
        this.getList();
    }

    getList() {
        this.query.setReq({
            url: '/api/crm/roles',
            method: 'get',
            variables: {
                page: this.page,
                per_page: this.size,
            },
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return {
                page: this.page,
                per_page: this.size,
            };
        }, searchData => {
            this.query.setReq({
                url: '/api/crm/roles',
                method: 'get',
                variables: {
                    page: this.page,
                    per_page: this.size,
                },
            });
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    setColumns() {
        this.columns = [
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
            {
                title: '状态',
                width: '15%',
                dataIndex: 'status_text',
                render: (text: any, record: any, index: number) => {
                    return (
                        <Tag color={record.status === 1 ? 'blue' : 'red'}>{text}</Tag>
                    );
                },
            },
            // {
            //     title: '操作',
            //     width: '15%',
            //     key: 'action',
            //     dataIndex: 'action',
            //     render: (text: any, record: any, index: any) => (
            //         <div>
            //             <a href='javascript:;' onClick={() => {
            //                 this.props.history.push(`/operatePlat/role/edit/${record.id}`);
            //             }} >修改</a>
            //         </div>
            //     ),
            // },
        ];
    }

    render() {
        const dataSource = (_.get(toJS(this.resultData), 'list') as any[] || []).map((r, i) => {
            r['key'] = i;
            return r;
        });

        return (
            <div style={{ padding: 24 }}>
                {/* <Button type='primary'
                    style={{ marginBottom: '15px' }}
                    onClick={() => {
                        this.props.history.push(`/operatePlat/role/edit`);
                    }} >添加</Button> */}

                <Table columns={toJS(this.columns)}
                    loading={this.loading}
                    pagination={{
                        current: this.page,
                        total: (_.get(toJS(this.resultData), 'total') as number || 0),
                        defaultPageSize: this.size,
                        onChange: (page, pageSize) => {
                            this.page = page;
                            this.size = pageSize;
                        },
                    }}
                    dataSource={dataSource} />
            </div>
        );
    }
}

export const List = withRouter(withAppState(ListView));
