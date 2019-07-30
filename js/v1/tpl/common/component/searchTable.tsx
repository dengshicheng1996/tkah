import { RcBaseFormProps, WrappedFormUtils } from 'antd/lib/form/Form';
import { TableProps } from 'antd/lib/table/interface';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { Table } from 'common/antd/table';
import { Querier, Request } from 'common/component/restFull';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

interface TableListProps extends RcBaseFormProps {
    /**
     *
     * @description 导入的rc-form/Form.create() props form 参数
     * @type {*}
     */
    form?: WrappedFormUtils;
    /**
     *
     * @description 搜索默认值
     * @type {*}
     */
    autoSearch?: any;
    /**
     *
     * @description 请求地址，必传
     * @type {string}
     */
    requestUrl: string;
    /**
     *
     * @description 请求方式
     * @type {string}
     */
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /**
     *
     * @description table props
     * @type {TableProps<any>}
     */
    tableProps?: TableProps<any>;
    /**
     *
     * @description 搜索项
     * @type {({
     *         search?: Array<TypeFormItem | ComponentFormItem>;
     *     })}
     */
    query?: {
        search?: Array<TypeFormItem | ComponentFormItem>;
    };
    /**
     *
     * @description 返回结果key解析 默认list
     * @type {string}
     */
    listKey?: string;
    /**
     *
     * @description 列表上面的组件
     * @type {JSX.Element}
     */
    otherComponent?: JSX.Element;
    /**
     *
     * @description 请求发送前 拦截并处理请求发送数据
     */
    beforeRequest?: (data: any) => any;
    /**
     *
     * @description 处理请求结果
     * @param {*} data 请求结果
     * @param {*} req 请求参数
     * @returns 返回请求结果
     */
    requestCallback?: (data: any, req: Request<any>) => any;
    /**
     *
     * @description 是否隐藏table
     */
    hideTable?: boolean;
    afterRequest?: (data: any) => any;
}

@observer
export class TableList extends React.Component<TableListProps, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];
    private listKey: string = this.props.listKey || 'list';
    private searchType: any = {};
    private resultData: any;

    @observable private requestData: any;
    @observable private loading: boolean = false;

    @observable private page: number = this.props.autoSearch && this.props.autoSearch.page || 1;
    @observable private size: number = 20;

    @observable private showMore: boolean = false;

    constructor(props: TableListProps) {
        super(props);
        if (this.props.query && this.props.query.search) {
            this.props.query.search.map((item: any) => {
                this.searchType[item.key] = item.type;
            });
        }
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getList();
        this.setDisposers();
    }

    componentWillReceiveProps() {
        if (this.props.query && this.props.query.search) {
            this.props.query.search.map((item: any) => {
                this.searchType[item.key] = item.type;
            });
        }
    }

    getList = () => {
        let data = _.assign(this.props.form.getFieldsValue(), { __now__: new Date().getTime(), page: this.page, per_page: this.size });
        data = this.props.beforeRequest ? this.props.beforeRequest(data) : data;
        const json: any = {};
        for (const i of Object.keys(data)) {
            if (this.searchType[i] === 'select' && (data[i] === '-1' || data[i] === -1)) {
                continue;
            }
            if (data[i] !== undefined && data[i] !== '') {
                json[i] = data[i];
            }
        }
        this.query.setReq({
            url: this.props.requestUrl,
            method: this.props.method || 'get',
            variables: json,
        }).then((res) => this.props.afterRequest && this.props.afterRequest(_.get(this.query.result, 'result') as any));
    }

    setDisposers() {
        this.disposers.push(reaction(() => {
            return {
                page: this.page,
                per_page: this.size,
            };
        }, searchData => {
            this.getList();
        }));

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result') as any) || undefined;
        }, searchData => {
            if (this.props.requestCallback) {
                this.resultData = this.props.requestCallback(toJS(searchData), this.query.getReq());
                return;
            }
            this.resultData = searchData && searchData.data ? searchData.data : [];
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
            if (this.page === 1) {
                this.getList();
            } else {
                this.page = 1;
            }
        }
    }

    ButtonComponent() {
        return (
            <div key={3000} style={{ textAlign: 'center' }}>
                <Button icon='delete' style={{ marginRight: '10px' }} onClick={() => {
                    this.clearSearch();
                }}>重 置</Button>
                <Button type='primary' icon='search' onClick={() => {
                    if (this.page === 1) {
                        this.getList();
                    } else {
                        this.page = 1;
                    }
                }}>查 询</Button>
                {
                    this.props.query && this.props.query.search && this.props.query.search.length >= 8 ?
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
                {
                    this.props.hideTable ? '' : <Table {...this.getTableProps()} />
                }
            </div>
        );
    }

    private getSearch() {
        let search: Array<TypeFormItem | ComponentFormItem> = this.props.query.search.slice();
        const autoSearch: any = this.props.autoSearch || {};
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 24 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 24 },
            },
        };
        if (this.props.query.search.length >= 8) {
            if (this.showMore) {
                search.push({ key: 'button', component: this.ButtonComponent(), formItemLayout });
            } else {
                search.splice(7, 0, { key: 'button', component: this.ButtonComponent(), formItemLayout });
                search = search.splice(0, 8);
            }
        }
        if (this.props.query.search.length < 8) {
            search.push({ key: 'button', component: this.ButtonComponent(), formItemLayout });
        }
        search.map((item: any) => {
            if (autoSearch[item.key]) {
                item.initialValue = autoSearch[item.key];
            }
            if (!item.formItemLayout) {
                item.formItemLayout = {
                    labelCol: {
                        span: 9,
                    },
                    wrapperCol: {
                        span: 15,
                    },
                };
            }
            if (item.itemProps) {
                item.itemProps.hasFeedback = false;
            }
        });
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
