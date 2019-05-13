import { Button } from 'common/antd/button';
import { Col } from 'common/antd/col';
import { Input } from 'common/antd/input';
import { Popconfirm } from 'common/antd/popconfirm';
import { Row } from 'common/antd/row';
import { Table } from 'common/antd/table';
import { Radium } from 'common/radium';
import { mutate, Querier } from 'common/restFull';
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
    private columns: any[];

    @observable private loading: boolean = false;
    @observable private resultData: any;
    @observable private detailData: any;

    @observable private phone: string;

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
            url: '/api/crm/users',
            method: 'get',
            variables: {
                phone: this.phone && this.phone.length > 0 ? this.phone : undefined,
                page: this.page,
                per_page: this.size,
            },
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return {
                phone: this.phone && this.phone.length > 0 ? this.phone : undefined,
                page: this.page,
                per_page: this.size,
            };
        }, searchData => {
            this.query.setReq({
                url: 'api/crm/users',
                variables: {
                    phone: this.phone && this.phone.length > 0 ? this.phone : undefined,
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
                title: '用户名',
                width: '15%',
                dataIndex: 'username',
            },
            {
                title: '手机号',
                width: '15%',
                dataIndex: 'phone',
            },
            {
                title: '角色',
                width: '15%',
                dataIndex: 'role_name',
            },
            {
                title: '操作',
                width: '15%',
                key: 'action',
                dataIndex: 'action',
                render: (text: any, record: any, index: any) => (
                    <div>
                        <span>
                            <a href='javascript:;' onClick={() => {
                                this.props.history.push(`/operatePlat/account/edit/${record.id}`);
                            }} >修改 </a>|
                        <Popconfirm title='确认删除?' onConfirm={() => {
                                this.del(record.id);
                            }}>
                                <a href='javascript:;'>  删除</a>
                            </Popconfirm>
                        </span>
                    </div>
                ),
            },
        ];
    }

    render() {
        const dataSource = (_.get(toJS(this.resultData), 'list') as any[] || []).map((r, i) => {
            r['key'] = i;
            return r;
        });

        return (
            <div style={{ padding: 24 }}>
                <Row gutter={20} style={{ marginBottom: '20px' }}>
                    <Col span={8}>
                        <Input.Search
                            placeholder='输入手机号'
                            onSearch={value => this.phone = value}
                        />
                    </Col>
                </Row>

                <Button type='primary'
                    style={{ marginBottom: '15px' }}
                    onClick={() => {
                        this.props.history.push(`/operatePlat/account/edit`);
                    }} >添加</Button>

                <Table columns={toJS(this.columns)}
                    loading={this.loading}
                    pagination={{
                        current: this.page,
                        total: (_.get(toJS(this.resultData), 'count') as number || 0),
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

    private del = (id: any) => {
        mutate({
            url: '',
            variables: {
                id,
            },
        }).then((r) => {
            this.query.refresh();
        });
    }
}

export const List = withRouter(withAppState(ListView));
