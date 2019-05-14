import { Button, Col, DatePicker, Form, Input, message, Row, Select } from 'antd';
import * as moment from 'moment';
import * as React from 'react';
import { getSeparator } from '../../common/tools';

const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;
const FormItem = Form.Item;
const InputGroup = Input.Group;
interface SearchProps {
    form: any;
    onChange?: any;
    searchFunction?: any;
    field?: any[];
    autoSearch?: object;
}

interface SearchState {
    selectArr: any[];
    dateArr: any[];
    showMore: boolean;
    betweenValue?: any;
}

class SearchComponent extends React.Component<SearchProps, SearchState> {
    private separator = getSeparator();
    constructor(props: any) {
        super(props);
        this.state = {
            selectArr: [],
            dateArr: [],
            showMore: false,
            betweenValue: {},
        };
        const search = props.field || [];
        const autoSearch = props.autoSearch || {};
        search.map((item: any, index: number) => {
            if (index === 7 && !this.state.showMore) {
                this.state.selectArr.push({ type: 'button' });
            }
            let isTime = false;
            if (item.type === 'date' || item.type === 'range') {
                isTime = true;
            }
            let initialValue: any = autoSearch[item.key];
            if (isTime && autoSearch[item.startime] && autoSearch[item.endtime]) {
                const startMomoent = moment(autoSearch[item.startime] * 1000);
                const endMomoent = moment(autoSearch[item.endtime] * 1000);
                initialValue = [startMomoent, endMomoent];
            }
            let obj: {
                fields: string;
                selectAllName?: string;
                name: string,
                placeholder?: string,
                onChange?: any,
                initialValue?: string | number,
                option?: [],
                type: string,
                startTime?: string;
                endTime?: string;
                showSearch?: boolean;
            } = {
                fields: item.key,
                name: item.name,
                placeholder: item.placeholder || item.name,
                onChange: item.onChange,
                option: [],
                type: '',
                startTime: '',
                endTime: '',
                showSearch: false,
            };
            if (item.type === 'string' || item.type === 'input' || item.type === 'newString') {
                obj.type = 'input';
            } else if (item.type === 'select' || item.type === 'channerlSelect') {
                obj.type = 'select';
                let test = false;
                let selectAllName = '全部';
                obj.option = item.options.map((it: any) => {
                    if (initialValue !== undefined) {
                        if (it.value === initialValue) {
                            test = true; // 初始值和参数值全等
                        } else if (typeof it.value === 'number' && !isNaN(+initialValue) && it.value === +initialValue) {
                            test = true; // 参数为数字，初始值可以转为数字，切转为数字后和参数值全等，初始值转为数字处理
                            obj.initialValue = +initialValue;
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
                obj.showSearch = item.showSearch;
            } else if (item.type === 'date' || item.type === 'range') {
                obj.type = 'range';
                obj.startTime = item.startime;
                obj.endTime = item.endtime;
            } else if (item.type === 'between') {
                obj = item;
            }
            if (item.initialValue) {
                obj.initialValue = item.initialValue;
            }
            this.state.selectArr.push(obj);
        });
        if (search.length <= 7 || this.state.showMore) {
            this.state.selectArr.push({ type: 'button' });
        }
    }

    componentWillReceiveProps(nextProps: any) {
        const search = nextProps.field || [];
        const selectArr = [];
        const autoSearch = nextProps.autoSearch || {};
        search.map((item: any, index: number) => {
            let isTime = false;
            if (item.type === 'date' || item.type === 'range') {
                isTime = true;
            }
            let initialValue: any = autoSearch[item.key];
            if (isTime && autoSearch[item.startime] && autoSearch[item.endtime]) {
                const startMomoent = moment(autoSearch[item.startime] * 1000);
                const endMomoent = moment(autoSearch[item.endtime] * 1000);
                initialValue = [startMomoent, endMomoent];
            }
            let obj: {
                fields: string;
                selectAllName?: string;
                name: string,
                placeholder?: string,
                onChange?: any,
                initialValue?: string | number,
                option?: [],
                type: string,
                startTime?: string;
                endTime?: string;
                showSearch?: boolean;
            } = {
                fields: item.key,
                name: item.name,
                placeholder: item.placeholder || item.name,
                onChange: item.onChange,
                initialValue,
                option: [],
                type: '',
                startTime: '',
                endTime: '',
                showSearch: false,
            };
            if (index === 7 && !this.state.showMore) {
                selectArr.push({ type: 'button' });
            }
            if (item.type === 'string' || item.type === 'input' || item.type === 'newString') {
                obj.type = 'input';
            } else if (item.type === 'select' || item.type === 'channerlSelect') {
                obj.type = 'select';
                let test = false;
                let selectAllName = '全部';
                obj.option = item.options.map((it: any) => {
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
                obj.showSearch = item.showSearch;
            } else if (item.type === 'date' || item.type === 'range') {
                obj.type = 'range';
                obj.startTime = item.startime;
                obj.endTime = item.endtime;
            } else if (item.type === 'between') {
                obj = item;
            }
            if (item.initialValue) {
                obj.initialValue = item.initialValue; // 默认的初始值覆盖匹配初始值
            }
            selectArr.push(obj);
        });

        if (search.length <= 7 || this.state.showMore) {
            selectArr.push({ type: 'button' });
        }
        this.setState({ selectArr });
    }
    getSearchData() {
        let postData: any = {};
        const { selectArr, betweenValue } = this.state;
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

    betweenChange(e: any, key: any) {
        const betweenValue: any = this.state.betweenValue;
        betweenValue[key] = e.target.value;
        this.setState({ betweenValue });
    }

    row() {
        const { selectArr } = this.state;
        const l = Math.ceil(selectArr.length / 4);
        const component = [];
        for (let i = 0; i < l; i++) {
            component.push(<Row key={i} style={{ marginBottom: 10 }} gutter={16}>
                {this.col(i)}
            </Row>);
        }
        return component;
    }

    col(i: number) {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 7 },
            wrapperCol: { span: 15 },
        };
        const comArr = [];
        const { selectArr, showMore } = this.state;
        const { onChange } = this.props;

        for (let x = 0; x <= 3; x++) {
            const obj = selectArr[i * 4 + x];
            if (obj) {
                const init: any = {};
                init.initialValue = obj.initialValue;
                if (obj.type === 'button') {
                    comArr.push(
                        <Col key={i * 4 + x} span={6} style={{ textAlign: 'center' }}>
                            <Button icon='delete' style={{ marginRight: '10px' }} onClick={() => {
                                this.clearSearch();
                            }}>重 置</Button>
                            <Button type='primary' icon='search' onClick={() => {
                                this.handleSearch();
                            }}>查 询</Button>
                            {
                                selectArr.length - 1 > 7 ?
                                    <a style={{ marginLeft: 10 }}
                                        onClick={() => this.showMoreSearch()}>{showMore ? '收起' : '展开'}</a>
                                    : null
                            }
                        </Col>);
                } else if (obj.type === 'between') {
                    comArr.push(
                        <Col key={i * 4 + x} span={6} style={{ textAlign: 'center' }}>
                            <FormItem
                                style={{ marginBottom: 5 }}
                                {...formItemLayout}
                                label={<span style={{ fontSize: '12px' }}>{obj.nameList.name}</span>}
                            >
                                <InputGroup compact>
                                    <Input style={{ width: '40%', textAlign: 'center' }} onChange={(e) => {
                                        this.betweenChange(e, obj.keyList.startKey);
                                    }} value={this.state.betweenValue[obj.keyList.startKey]}
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
                                    }} value={this.state.betweenValue[obj.keyList.endKey]}
                                        placeholder={obj.nameList.endName} />
                                </InputGroup>
                            </FormItem>
                        </Col>);
                } else {
                    comArr.push(
                        <Col key={i * 4 + x} span={6}>
                            <FormItem
                                style={{ marginBottom: 5 }}
                                {...formItemLayout}
                                label={<span style={{ fontSize: '12px' }}>{obj.name}</span>}
                            >
                                {getFieldDecorator(obj.fields, init)(
                                    (() => {
                                        let type;
                                        let placeholder = obj.placeholder;
                                        switch (obj.type) {
                                            case 'input':
                                                type = <Input style={{ fontSize: '12px' }} autoComplete='off'
                                                    onChange={(e) => {
                                                        setTimeout(() => {
                                                            onChange && onChange(this.getSearchData());
                                                            obj.onChange && obj.onChange(e);
                                                        }, 4);
                                                    }} type='text' placeholder={placeholder} />;
                                                break;
                                            case 'select':
                                                placeholder = obj.name;
                                                type = <Select
                                                    showSearch={obj.showSearch || false}
                                                    onChange={(e) => {
                                                        setTimeout(() => {
                                                            onChange && onChange(this.getSearchData());
                                                            obj.onChange && obj.onChange(e);
                                                        }, 4);
                                                    }} placeholder={placeholder}>
                                                    {obj.option.map((item: any, index: number) => <Option key={item.value + index}
                                                        value={obj.showSearch ? item.label + this.separator + item.value : item.value}>{item.label}</Option>)}
                                                </Select>;
                                                break;
                                            case 'range':
                                                type = <RangePicker style={{ width: '100%' }} onChange={(e) => {
                                                    setTimeout(() => {
                                                        onChange && onChange(this.getSearchData());
                                                        obj.onChange && obj.onChange(e);
                                                    }, 4);
                                                }}
                                                />;
                                                break;
                                        }
                                        return type;
                                    })())}
                            </FormItem>
                        </Col>);
                }

            }
        }
        return comArr;
    }

    clearSearch() {
        this.props.form.resetFields();
        const { betweenValue } = this.state;
        if (betweenValue) {
            this.setState({ betweenValue: {} });
        }
    }

    showMoreSearch() {
        const { selectArr } = this.state;
        let button = {};
        let index = 0;
        let showMore;
        selectArr.map((item, i) => {
            if (item.type === 'button') {
                button = item;
                index = i;
            }
        });
        if (index === 7) {
            selectArr.splice(7, 1);
            showMore = true;
            selectArr.push(button);
        } else {
            showMore = false;
            selectArr.pop();
            selectArr.splice(7, 0, button);
        }
        this.setState({ showMore, selectArr });
    }

    keydown(e: any) {
        if (e.keyCode === 13) {
            this.handleSearch();
        }
    }

    handleSearch = () => {
        const { selectArr, betweenValue } = this.state;
        let test = true;
        selectArr.map((item: any) => {
            if (item.type === 'between') {
                if (!betweenValue[item.keyList.startKey] === !!betweenValue[item.keyList.endKey]) {
                    message.warning('请填写' + item.nameList.name + '的最大值和最小值');
                    test = false;
                    return;
                }
                if (+betweenValue[item.keyList.startKey] > +betweenValue[item.keyList.endKey]) {
                    message.warning(item.nameList.name + '的最大值应大于等于最小值');
                    test = false;
                    return;
                }
            }
        });
        if (test) {
            const postData = this.getSearchData();
            if (this.props.searchFunction) {
                this.props.searchFunction(postData);
            }
            return postData;
        }
    }
    showAllSearch() {
        let arr;
        const { showMore } = this.state;
        arr = this.row();
        const component: any[] = [];
        arr.map((item, index) => {
            if (index > 1) {
                component.push(<div key={index} style={showMore ? { display: 'block' } : { display: 'none' }}>{item}</div>);
            } else {
                component.push(item);
            }
        });
        return component;

    }
    render() {
        return (
            <Form
                style={{
                    marginTop: 10,
                }}
                hideRequiredMark
                onSubmit={() => this.handleSearch()}
                onKeyDown={e => this.keydown(e)}
            >
                {
                    this.showAllSearch()
                }
            </Form>
        );
    }
}

const SearchInput = Form.create()(SearchComponent);

export default SearchInput;
