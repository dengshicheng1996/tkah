import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { Table } from 'common/antd/table';
import {BaseForm} from 'common/formTpl/baseForm';
import { getSeparator } from 'common/tools';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as moment from 'moment';
import * as React from 'react';
import { getPromise } from '../../common/ajax';
const InputGroup = Input.Group;
/*!
 * 带搜索框的表格
 * 属性：columns表头，必传 data数据，必传 requestUrl：请求地址，必传 search搜索框内容，非必传  rowKey：每一行的key值，非必传 listKey：请求到的列表的key，默认为'list'
 *  className：样式，非必传 callback：请求到数据之后的回调，非必传 requestValues：请求参数传入，非必传
 * onRowClick：行点击事件，非必传 pageSize：非必传
 * isShowCheck：每一行是否展示复选框，非必传，优化中
 *
 */
interface TableListProps {
    form?: WrappedFormUtils; // form
    // form: any; // form
    autoSearch?: object;    // autoSearch：搜索值传入，非必传
    refresh?: any;          // 控制刷新列表，非必传
    onChange?: any;         // 重新加载数据的时候执行的额外函数，非必传
    search?: any[];         // 搜索项，非必传
    pageSize?: number;      // 每页的数据量，非必传，默认20
    requestUrl: string;     // 请求地址，必传
    requestValues?: any;    // 额外的请求参数，非必传
    columns?: any[];        // columns表头，必传
    scroll?: any;           // scroll，必传
    listKey?: string;      // listKey，非必传,默认list
    onRowClick?: any;      // row点击回调，非必传
    bordered?: any;        // 边框，直接传入到table组件，非必传
    className?: any;       // 额外的class，非必传
    rowKey?: any;          // 每一行的key值，非必传
    isShowCheck?: boolean; // 显示单选、全选框，非必传
    otherButton?: any;     // 列表上面的额外按钮，非必传
    searchOnChange?: any;  // 搜索值变化时的回调，传入变化后的参数值，非必传
    pagination?: any;      // 页面配置对象，组件有默认值，非必传
}

@observer
class TableList extends React.Component<TableListProps, {}> {
    static defaultProps = {
        rowKey: 'id',
        listKey: 'list',
    };
    @observable private refresh: boolean = false;
    @observable private showMore: boolean = false;
    @observable private selectArr: any[] = [];
    @observable private searchData: any = {};
    @observable private selectedRowKeys: any = [];
    @observable private data: any[] = [];
    @observable private betweenValue: any = {};
    @observable private loading: boolean = false;
    @observable private separator: string = getSeparator();
    @observable private pagination: any = this.props.pagination || {
        pageSize: this.props.pageSize || 20,
        onChange: this.onPaginationChange.bind(this),
        total: 0,
        current: 1,
        amountSum: 0,
        showTotal: (total: any) => {
            return `共 ${total} 条`;
        },
    };

    constructor(props: any) {
        super(props);
        const search = props.search || [];
        const selectArr = [];
        const autoSearch = props.autoSearch || {};
        search.map((item: any, index: number) => {
            let initialValue: any = autoSearch[item.key];
            if (item.type === 'date' && autoSearch[item.startime] && autoSearch[item.endtime]) {
                const startMomoent = moment(autoSearch[item.startime] * 1000);
                const endMomoent = moment(autoSearch[item.endtime] * 1000);
                initialValue = [startMomoent, endMomoent];
            }
            const obj: any = _.assign({}, item);
            if (!obj.itemProps) {
                obj.itemProps = {
                    label: item.label,
                    hasFeedback : false,
                };
            } else {
                obj.itemProps.hasFeedback = false;
            }
            if (!this.showMore) {
                if (index === 7) {
                    selectArr.push({ type: 'button', component: this.ButtonComponent() });
                } else if (index > 7) {
                    obj.hide = false;
                }
            }
            if (item.type === 'select') {
                let test = false;
                let selectAllName = '全部';
                obj.options = item.options.map((it: any) => {
                    if (initialValue !== undefined) {
                        if (item.showSearch) {
                            if (it.label + this.separator + it.value === initialValue) {
                                test = true;
                            }
                        } else {
                            if (it.value === initialValue) {
                                test = true; // 初始值和参数值全等
                            } else if (typeof it.value === 'number' && !isNaN(+initialValue) && it.value === +initialValue) {
                                test = true; // 参数为数字，初始值可以转为数字，切转为数字后和参数值全等，初始值转为数字处理
                                obj.initialValue = +initialValue;
                            }
                        }
                    }
                    if (it.value === '-1' || it.value === -1) {
                        it.value = '-1';
                        selectAllName = it.label;
                    }
                    if (item.showSearch) {
                        it.value = it.label + this.separator + it.value;
                    }
                    return it;
                });
                if (!test) {
                    obj.initialValue = item.selectNoAll ? undefined : item.showSearch ? selectAllName + this.separator + '-1' : '-1';
                }
                obj.selectAllName = selectAllName;
            } else if (item.type === 'between') {
                obj.component = this.betweenComponent(item);
            }
            if (item.initialValue) {
                obj.initialValue = item.initialValue; // 默认的初始值覆盖匹配初始值
            }
            selectArr.push(obj);
        });
        if (search.length <= 7 || this.showMore) {
            selectArr.push({ type: 'button', key: 'button', component: this.ButtonComponent() });
        }
        this.selectArr = selectArr;
    }
    componentDidMount() {
        this.getData(this.props.autoSearch);
    }
    componentWillReceiveProps(nextProps: any) {
        if (this.props.refresh !== nextProps.refresh) {
            this.getData();
        }
        const search = nextProps.search || [];
        const selectArr = [];
        const autoSearch = nextProps.autoSearch || {};
        search.map((item: any, index: number) => {
            let initialValue: any = autoSearch[item.key];
            if (item.type === 'date' && autoSearch[item.startime] && autoSearch[item.endtime]) {
                const startMomoent = moment(autoSearch[item.startime] * 1000);
                const endMomoent = moment(autoSearch[item.endtime] * 1000);
                initialValue = [startMomoent, endMomoent];
            }
            const obj: any = _.assign({}, item);
            if (!obj.itemProps) {
                obj.itemProps = {
                    label: item.label,
                    hasFeedback : false,
                };
            } else {
                obj.itemProps.hasFeedback = false;
            }
            if (!this.showMore) {
                if (index === 7) {
                    selectArr.push({ type: 'button', component: this.ButtonComponent() });
                } else if (index > 7) {
                    obj.hide = false;
                }
            }
            if (item.type === 'select') {
                let test = false;
                let selectAllName = '全部';
                obj.options = item.options.map((it: any) => {
                    if (initialValue !== undefined) {
                        if (item.showSearch) {
                            if (it.label + this.separator + it.value === initialValue) {
                                test = true;
                            }
                        } else {
                            if (it.value === initialValue) {
                                test = true; // 初始值和参数值全等
                            } else if (typeof it.value === 'number' && !isNaN(+initialValue) && it.value === +initialValue) {
                                test = true; // 参数为数字，初始值可以转为数字，切转为数字后和参数值全等，初始值转为数字处理
                                obj.initialValue = +initialValue;
                            }
                        }
                    }
                    if (it.value === '-1' || it.value === -1) {
                        it.value = '-1';
                        selectAllName = it.label;
                    }
                    return it;
                });
                if (!test) {
                    obj.initialValue = item.selectNoAll ? undefined : item.showSearch ? selectAllName + this.separator + '-1' : '-1';
                }
                obj.selectAllName = selectAllName;
            } else if (item.type === 'between') {
                obj.component = this.betweenComponent(item);
            }
            if (item.initialValue) {
                obj.initialValue = item.initialValue; // 默认的初始值覆盖匹配初始值
            }
            selectArr.push(obj);
        });
        if (search.length <= 7 || this.showMore) {
            selectArr.push({ type: 'button', key: 'button', component: this.ButtonComponent() });
        }
        this.selectArr = selectArr;
    }
    betweenChange(e: any, key: any) {
        this.betweenValue[key] = e.target.value ;
    }
    betweenComponent(obj: any) {
        return (
        <InputGroup compact>
            <Input style={{ width: '40%', textAlign: 'center' }} onChange={(e) => {
                this.betweenChange(e, obj.keyList.startKey);
            }} value={this.betweenValue[obj.keyList.startKey]}
                   placeholder={obj.nameList.startName} />
            <Input
                style={{
                    width: '20%',
                    borderRight: 'none',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    backgroundColor: '#fff',
                }}
                placeholder='~'
                disabled
            />
            <Input style={{ width: '40%', textAlign: 'center' }} onChange={(e) => {
                this.betweenChange(e, obj.keyList.endKey);
            }} value={this.betweenValue[obj.keyList.endKey]}
                   placeholder={obj.nameList.endName} />
        </InputGroup>
        );
    }
    ButtonComponent() {
        return (
            <div key={3000}>
                <Button icon='delete' style={{ marginRight: '10px' }} onClick={() => {
                    this.clearSearch();
                }}>重 置</Button>
                <Button type='primary' icon='search' onClick={() => {
                    this.handleSearch();
                }}>查 询</Button>
                {
                    this.selectArr.length - 1 > 7 ?
                        <a style={{ marginLeft: 10 }}
                           onClick={() => this.showMoreSearch()}>{this.showMore ? '收起' : '展开'}</a>
                        : null
                }
            </div>
        );
    }
    showMoreSearch() {
        this.selectArr.map((item: any, index: number) => index > 7 && (item.hide = !item.hide));
    }
    handleSearch() {
        this.getData(this.getSearchData());
    }
    clearSearch() {
        this.props.form.resetFields();
        this.betweenValue = {};
    }
    getSearchData() {
        let postData: any = {};
        const { selectArr, betweenValue } = this;
        this.props.form.validateFields((err: any, values: any) => {
            selectArr.map(item => {
                let key = item.fields;
                if (values[key] !== undefined) {
                    if (item.type === 'between') {
                        return true;
                    }
                    if (item.type === 'select') {
                        if (values[key] === -1 || values[key] === '-1') { // 如果为-1直接return
                            return;
                        } else if (item.showSearch) {
                            const value = values[key].split(this.separator)[1];
                            if (value === -1 || value === '-1') {// 通过分隔符分割后如果value 为-1即全部直接return
                                return;
                            } else {
                                return postData[key] = value;   // 否则就直接赋值
                            }
                        } else {
                            if (values[key] !== '') {
                                return postData[key] = values[key];
                            }
                        }
                    }
                    if (values[key] instanceof Array) {
                        if (values[key] && values[key][0] && values[key][1]) {
                            postData[item.startTime] = values[key][0].valueOf() / 1000;
                            postData[item.endTime] = values[key][1].valueOf() / 1000;
                        }
                    } else {
                        key = item.fields;
                        postData[key] = values[key] === '' ? undefined : values[key];
                    }
                }
            });
        });
        if (betweenValue) {
            postData = { ...postData, ...betweenValue };
        }
        return postData;
    }
    getData = (data?: any) => {
        const searchData = data || this.searchData;
        const obj: any = {};
        // 过滤空字符串
        for (const key of Object.keys(searchData)) {
            if (data[key] !== undefined && data[key] !== '') {// 去除undefined 和 空
                obj[key] = data[key];
            }
        }
        this.searchData = obj;
        getPromise(this.props.requestUrl, obj).then((resData: any) => {
            this.loading = false;
            this.data = resData.data[this.props.listKey];
        }).catch(err => {
            this.loading = false;
        });

    }
    returnData() { // 外部获取列表数据
        return this.data;
    }
    renderList(data: any) { // 外部直接渲染data
        this.data = data;
    }
    onPaginationChange(current: string | number) {
        this.pagination.current = current;
        const { searchData = { page: 1 } } = this;
        searchData.page = current;
        this.getData(searchData);
    }
    keydown(e: any) {
        if (e.keyCode === 13) {
            this.handleSearch();
        }
    }
    handleRowDidSelected = (record: any, index: number) => {
        if (this.props.onRowClick) {
            this.props.onRowClick(record, index);
        }
    }
    // checkbox
    onSelectChange = (selectedRowKeys: any) => {
        this.selectedRowKeys = selectedRowKeys ;
    }
    render() {
        const pagination = this.pagination;
        const props: any = {
            className: this.props.className,
            rowKey: this.props.rowKey,
            pagination,
            bordered: this.props.bordered,
        };
        const dataSource = this.data.map((o, index) => {
            if (o.key === undefined) {
                o.key = index;
            }
            return o;
        });
        return (
            <div>
                {
                    this.props.search && this.props.search.length > 0 && <BaseForm keydown={(e) => this.keydown(e)} form={this.props.form} item={toJS(this.selectArr)} col={4}/>
                }
                {
                    this.props.otherButton ? <div style={{ margin: '15px 0' }}>
                        {this.props.otherButton}
                    </div> : null
                }
                <Table {...props}
                    loading={this.loading}
                    onRow={(record, index) => {
                        return {
                            onClick: (event: any) => {
                                event.stopPropagation();
                                this.handleRowDidSelected(record, index);
                            },
                        };
                    }}
                    columns={this.props.columns}
                    scroll={this.props.scroll}
                    dataSource={dataSource} />
            </div>
        );
    }
}
const TableForm = Form.create()(TableList);
export default TableForm;
