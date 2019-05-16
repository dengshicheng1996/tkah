import { RcBaseFormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { TableProps } from 'antd/lib/table/interface';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { Table } from 'common/antd/table';
import { Querier } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

interface TableListProps extends RcBaseFormProps {
    form?: WrappedFormUtils; // form
    requestUrl: string;     // 请求地址，必传
    tableProps: TableProps<any>;
    query?: {
        search?: BaseFormItem[];         // 搜索项，非必传
    };
    listKey?: string;      // listKey，非必传,默认list
    otherComponent?: JSX.Element;     // 列表上面的组件
}

@observer
export class TableList extends React.Component<TableListProps, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];
    private listKey: string = this.props.listKey || 'list';

    @observable private resultData: any;
    @observable private loading: boolean = false;

    @observable private page: number = 1;
    @observable private size: number = 20;

    @observable private showMore: boolean = false;

    constructor(props: TableListProps) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getList();
    }

    getList = () => {
        this.query.setReq({
            url: this.props.requestUrl,
            method: 'get',
            variables: this.props.form.getFieldsValue,
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    getData = () => {
        return this.resultData;
    }

    getQuery = () => {
        return this.query;
    }

    setData = (data: any) => { // 外部直接渲染data
        this.resultData = data;
    }

    keydown(e: any) {
        if (e.keyCode === 13) {
            this.query.setReq({
                url: this.props.requestUrl,
                method: 'get',
                variables: this.props.form.getFieldsValue,
            });
        }
    }

    ButtonComponent() {
        return (
            <div key={3000}>
                <Button icon='delete' style={{ marginRight: '10px' }} onClick={() => {
                    this.clearSearch();
                }}>重 置</Button>
                <Button type='primary' icon='search' onClick={() => {
                    this.getData();
                }}>查 询</Button>
                {
                    this.props.query && this.props.query.search && this.props.query.search.length > 8 ?
                        <a style={{ marginLeft: 10 }}
                            onClick={() => this.showMore = !this.showMore}>{this.showMore ? '收起' : '展开'}</a>
                        : null
                }
            </div>
        );
    }

    clearSearch() {
        this.props.form.resetFields();
    }

    render() {
        return (
            <div>
                {
                    this.props.query && this.props.query.search && this.props.query.search.length > 0 &&
                    <BaseForm keydown={(e) => this.keydown(e)}
                        form={this.props.form}
                        item={this.getSearch()}
                        col={4} />
                }
                {
                    this.props.otherComponent ? <div style={{ margin: '15px 0' }}>
                        {this.props.otherComponent}
                    </div> : null
                }
                <Table {...this.getTableProps()} />
            </div>
        );
    }

    private getSearch() {
        let search: BaseFormItem[] = this.props.query.search;
        search = search.slice(0, 8);
        if (this.props.query.search.length > 8 || this.showMore) {
            search.push({ type: 'button', key: 'button', component: this.ButtonComponent() });
        }
        return search;
    }

    private getTableProps = (): TableProps<any> => {
        const dataSource = (_.get(this.resultData, this.listKey) as any[] || []).map((o, index) => {
            if (o.key === undefined) {
                o.key = index;
            }
            return o;
        });

        const props: TableProps<any> = _.assign({}, {
            loading: this.loading,
            dataSource,
            pagination: {
                defaultPageSize: this.size,
                onChange: (page: number, pageSize: number) => {
                    this.page = page;
                    this.size = pageSize;
                },
                total: (_.get(toJS(this.resultData), 'total') as number || 0),
                current: this.page,
                showTotal: (total: any) => {
                    return `共 ${total} 条`;
                },
            },
        }, this.props.tableProps);

        return props;
    }
}

// @ts-ignore
export const SearchTable: typeof TableList = Form.create()(TableList);
