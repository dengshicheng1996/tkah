import { Button, Table } from 'antd';
import { message } from 'antd';
import * as _ from 'lodash';
import { computed } from 'mobx';
import * as React from 'react';
import { postFormDataPromise } from '../../common/ajax';
import SearchComponent from './SearchComponent';
/*!
 * 带搜索框的表格
 * 属性：columns表头，必传 data数据，必传 requestUrl：请求地址，必传 search搜索框内容，非必传  rowKey：每一行的key值，非必传 listKey：请求到的列表的key，默认为'list'
 *  className：样式，非必传 callback：请求到数据之后的回调，非必传 requestValues：请求参数传入，非必传
 * onRowClick：行点击事件，非必传 pageSize：非必传
 * isShowCheck：每一行是否展示复选框，非必传，优化中
 *
 */
interface TableListProps {
    autoSearch?: object;    // autoSearch：搜索值传入，非必传
    onChange?: any;         // 重新加载数据的时候执行的额外函数，非必传
    search?: any[];         // 搜索项，必传
    pageSize?: number;      // 每页的数据量，非必传，默认20
    requestUrl?: string;    // 请求地址，必传
    requestValues?: any;    // 额外的请求参数，非必传
    columns?: any[];        // columns表头，必传
    scroll?: any;           // scroll，必传
    // listType?: string;
    // listKey?: string;
    onRowClick?: any;      // row点击回调，非必传
    bordered?: any;        // 边框，直接传入到table组件，非必传
    className?: any;       // 额外的class，非必传
    rowKey?: any;          // 每一行的key值，非必传
    isShowCheck?: boolean; // 显示单选、全选框，非必传
    otherButton?: any;     // 列表上面的额外按钮，非必传
    searchOnChange?: any;  // 搜索值变化时的回调，传入变化后的参数值，非必传
    pagination?: any;      // 页面配置对象，组件有默认值，非必传
}

interface TableListState {
    data: any[];
    loading: boolean;
    selectedRowKeys: [];
    searchData: {
        pageid: number | string;
    };
}

class TableList extends React.Component<TableListProps, TableListState> {
    static defaultProps = {
        rowKey: 'id',
        listKey: 'list',
    };

    private pagination: any = this.props.pagination || {
        pageSize: this.props.pageSize || 20,
        onChange: this.onPaginationChange.bind(this),
        total: 0,
        current: 1,
        amountSum: 0,
        showTotal: (total) => {
            return `共 ${total} 条`;
        },
    };

    @computed get columns() {
        return this.props.columns;
    }

    @computed get scroll(): {
        x: number;
        y: number;
    } {
        return this.props.scroll;
    }

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            searchData: {
                pageid: 1,
            },
            loading: true,
            selectedRowKeys: [], // Check here to configure the default column
        };
    }

    componentDidMount() {
        // // TODO 修改点击非groupCheckbox弹框隐藏
        // document.onclick = () => {
        //     if (this.state.isShowUserList) {
        //         this.setState({
        //             isShowUserList: false,
        //         });
        //     }
        // };
        this.getData(this.props.autoSearch, true, null, null);
    }
    getSearch() {
        return this.state.searchData;
    }
    getData = (autoSearch: any, switchLoading: any, isRefresh: any, argumentSearch: any) => {
        const searchData =  argumentSearch || this.state.searchData;
        if (switchLoading) {
            this.setState({ loading: true });
        }
        const pageid = isRefresh ? 1 : this.pagination.current;
        // 数据请求
        const data: {
            values: {
                pageid: number|string,
                pagesize?: number|string;
            },
            url: string;
        } = {
            values: {
                pageid,
                pagesize: this.pagination.pageSize || 20,
            },
            url: this.props.requestUrl,
        };

        if (typeof this.props.requestValues !== 'undefined') {
            _.assign(data.values, this.props.requestValues);
        }
        if (autoSearch) {
            _.assign(data.values, autoSearch);
        }
        if (!_.isEmpty(searchData)) {
            _.assign(data.values, searchData);
        }
        const obj = {
            pageid: data.values['pageid'],
        }; // 过滤空字符串
        for (const key of Object.keys(data.values)) {
            if ( key === 'moduleId') { // modulId 允许传空 ，其他不允许空值直接不穿
                obj[key] = data.values[key];
                continue;
            }
            if (data.values[key] !== undefined && data.values[key] !== '') {// 去除undefined 和 空
                obj[key] = data.values[key];
            }
        }
        this.setState({ searchData: obj });
        data['values'] = obj;
        // postFormDataPromise('/manage/interface', data, (resData) => {
        //     const list: any[] = resData.data[this.props.listKey];
        //     if (resData.data.totalArr) {
        //         const totalArr: any = resData.data.totalArr;
        //         totalArr.loanDate = '总计';
        //         totalArr.channelName = '总计';
        //         list.unshift(totalArr);
        //     }
        //
        //     this.pagination.total = +resData.data[this.props.totalCountKey];
        //     if (!!this.props.requestValues && this.props.requestValues.costType === 'out') {
        //         this.pagination.amountSum = resData.data[this.props.amountCountKey];
        //         this.pagination.showTotal = (total) => {
        //             return `总计金额：${this.pagination.amountSum}元    共 ${total} 条`;
        //         };
        //     }
        //
        //     _.map(list, ((item, index) => {
        //         if (!item.id) {
        //             item.id = index;
        //         }
        //     }));
        //
        //     this.setState({
        //         data: list,
        //         loading: false,
        //     });
        //
        //     this.props.callBack && this.props.callBack(data.values, resData.data);
        //
        // }, (error) => {
        //     message.error(error);
        //     this.setState({ loading: false });
        // });

    }

    getListData() { // 外部获取列表数据
        return this.state.data;
    }

    renderList(data: any) { // 外部直接渲染data
        this.setState({ data });
    }

    onPaginationChange(current: string | number) {
        this.pagination.current = current;
        const { searchData = { pageid: 1 } } = this.state;
        searchData.pageid = current;
        this.getData({}, true, null, searchData);
    }

    handleRowDidSelected = (record: any, index: number) => {
        $('.ant-table-row')
            .eq(index)
            .css('background', '#eaf8fe')
            .siblings()
            .css('background', 'transparent');
        if (this.props.onRowClick) {
            this.props.onRowClick(record, index);
        }
    }

    searchFunction(data: any) {
        data.pageid = 1;
        this.pagination.current = 1;
        this.setState({ searchData: data });
        this.getData({}, true, null, data);
    }

    // 点击负责人列表确定触发刷新
    refreshList = () => {
        this.setState({ loading: true });
        // ajax request after empty completing
        setTimeout(() => {
            this.getData({}, true, null, null);
            this.setState({
                selectedRowKeys: [],
                loading: false,
            });
        }, 1000);
    }

    // checkbox
    onSelectChange = (selectedRowKeys: any) => {
        this.setState({ selectedRowKeys });
    }

    render() {
        const pagination = this.pagination;
        const props: any = {
            className: this.props.className,
            rowKey: this.props.rowKey,
            pagination,
            bordered: this.props.bordered,
        };
        const dataSource = this.state.data.map((o, index) => {
            if (o.key === undefined) {
                o.key = index;
            }
            return o;
        });

        return (
            <div>
                {
                    (this.props.search && this.props.search.length > 0) ?
                        <SearchComponent
                            autoSearch={this.props.autoSearch}
                            field={this.props.search}
                            searchFunction={(data) => this.searchFunction(data)}
                            onChange={this.props.searchOnChange} /> : null
                }
                {
                    this.props.otherButton ? <div style={{ margin: '15px 0 0' }}>
                        {this.props.otherButton}
                    </div> : null
                }
                <Table {...props}
                    loading={this.state.loading}
                    onRow={(record, index) => {
                        return {
                            onClick: (event) => {
                                event.stopPropagation();
                                this.handleRowDidSelected(record, index);
                            },
                        };
                    }}
                    columns={this.columns}
                    scroll={this.scroll}
                    dataSource={dataSource} />
            </div>
        );
    }
}
export default TableList;
