import { DatePickerDecorator, RangePickerProps } from 'antd/lib/date-picker/interface';
import { FormItemProps } from 'antd/lib/form';
import { FormLayout, GetFieldDecoratorOptions, WrappedFormUtils } from 'antd/lib/form/Form';
import { InputNumberProps } from 'antd/lib/input-number';
import Group from 'antd/lib/input/Group';
import { InputProps } from 'antd/lib/input/Input';
import Password from 'antd/lib/input/Password';
import Search from 'antd/lib/input/Search';
import TextArea from 'antd/lib/input/TextArea';
import { SelectProps } from 'antd/lib/select';
import { SwitchProps } from 'antd/lib/switch';
import { AntTreeNodeProps, TreeProps } from 'antd/lib/tree/Tree';
import { Checkbox } from 'common/antd/checkbox';
import { Col } from 'common/antd/col';
import { DatePicker } from 'common/antd/date-picker';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { InputNumber } from 'common/antd/input-number';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import { Switch } from 'common/antd/switch';
import * as _ from 'lodash';
import * as React from 'react';
const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;

/**
 *
 * @description 子选项
 * @interface OptionType
 * @extends {AntTreeNodeProps}
 */
export interface OptionType extends AntTreeNodeProps {
    /**
     *
     * @description 显示值
     * @type {*}
     */
    label?: any;
    /**
     *
     * @description 传递值
     * @type {*}
     */
    value?: any;
    /**
     *
     * @description 子集
     * @type {OptionType[]}
     */
    children?: OptionType[];
    /**
     *
     * @description 是否禁用
     * @type {boolean}
     */
    disabled?: boolean;
    /**
     *
     * @description 输入值改变后回调
     */
    onChange?: (e: any) => void;
}

/**
 *
 * @description 自定义组件
 * @interface ComponentProps
 */
interface ComponentProps {
    /**
     *
     * @description props
     * @type {(InputProps | SelectProps<any> | InputNumberProps |
     *     typeof Password | typeof TextArea | typeof Search | typeof Group |
     *     typeof CheckboxGroup | SwitchProps | DatePickerDecorator | RangePickerProps | TreeProps | {
     *         disabled?: boolean;
     *         placeholder?: string;
     *     })}
     */
    typeComponentProps?: InputProps | SelectProps<any> | InputNumberProps |
    typeof Password | typeof TextArea | typeof Search | typeof Group |
    typeof CheckboxGroup | SwitchProps | DatePickerDecorator | RangePickerProps | TreeProps | {
        disabled?: boolean;
        placeholder?: string;
    };
    /**
     *
     * @description 选项
     * @type {OptionType[]}
     */
    options?: OptionType[];
}

/**
 * @description 输入框类型
 */
type ItemType = 'input' | 'inputNumber' | 'textArea' | 'password' | 'selectMulti' | 'select' |
    'multiple' | 'checkbox' | 'switch' | 'datePicker' | 'rangePicker';

/**
 *
 * @description item 基础数据类型
 * @interface FormItem
 * @extends {ComponentProps}
 */
interface FormItem extends ComponentProps {
    /**
     *
     * @description 唯一标识
     * @type {string}
     */
    key?: string;
    /**
     *
     * @description item name
     * @type {string}
     */
    name?: string;
    /**
     *
     * @description 是否隐藏此选项
     * @type {boolean}
     */
    hide?: boolean;
    /**
     *
     * @description 显示布局
     * @type {{
     *         labelCol: {
     *             xs: {
     *                 span: number;
     *             };
     *             sm: {
     *                 span: number;
     *             };
     *         };
     *         wrapperCol: {
     *             xs: {
     *                 span: number;
     *             };
     *             sm: {
     *                 span: number;
     *             };
     *         };
     *     }}
     */
    formItemLayout?: {
        labelCol: {
            xs: {
                span: number;
            };
            sm: {
                span: number;
            };
        };
        wrapperCol: {
            xs: {
                span: number;
            };
            sm: {
                span: number;
            };
        };
    };
    /**
     *
     * @description 子节点field属性
     * @type {GetFieldDecoratorOptions}
     */
    fieldDecoratorOptions?: GetFieldDecoratorOptions;
    /**
     *
     * @description 子节点自定义 props
     * @type {*}
     */
    itemProps?: FormItemProps;
    /**
     *
     * @description 默认值
     * @type {*}
     */
    initialValue?: any;
    /**
     *
     * @description 是否引用 FormItem
     * @type {boolean}
     */
    formItem?: boolean;
    /**
     *
     * @description 是否必填
     * @type {boolean}
     */
    required?: boolean;
    /**
     *
     * @description 必填报错提示
     * @type {string}
     */
    message?: string;
}

export interface TypeFormItem extends FormItem {
    /**
     *
     * @description item 输入框 类型
     * @type {ItemType}
     */
    type: ItemType;
}

export interface ComponentFormItem extends FormItem {
    /**
     *
     * @description 自定义组件
     * @type {JSX.Element}
     */
    component: JSX.Element;
}

/**
 *
 * @description item 基础数据类型
 * @interface BaseFormItem
 * @extends {FormItem}
 */
export interface BaseFormItem extends FormItem {
    /**
     *
     * @description item 输入框 类型
     * @type {ItemType}
     */
    type?: ItemType;
    /**
     *
     * @description 自定义组件
     * @type {JSX.Element}
     */
    component?: JSX.Element;
}

interface BaseFormProps {
    /**
     *
     * @description 样式
     * @type {React.CSSProperties}
     */
    style?: React.CSSProperties;
    /**
     *
     * @description 导入的rc-form/Form.create() props form 参数
     * @type {*}
     */
    form: WrappedFormUtils;
    /**
     *
     * @description 选项
     * @type {BaseFormItem[]}
     */
    item: Array<TypeFormItem | ComponentFormItem>;
    /**
     *
     * @description item 显示方式
     * @type {FormLayout}
     */
    layout?: FormLayout;
    /**
     *
     * @description item 显示行数
     * @type {number}
     */
    col?: number;
    /**
     *
     * @description item 显示布局
     * @type {{
     *         labelCol?: {
     *             xs: {
     *                 span: number;
     *             };
     *             sm: {
     *                 span: number;
     *             };
     *         };
     *         wrapperCol?: {
     *             xs: {
     *                 span: number;
     *             };
     *             sm: {
     *                 span: number;
     *             };
     *         };
     *     }}
     */
    formItemLayout?: {
        labelCol?: {
            xs: {
                span: number;
            };
            sm: {
                span: number;
            };
        };
        wrapperCol?: {
            xs: {
                span: number;
            };
            sm: {
                span: number;
            };
        };
    };
    /**
     *
     * @description 提交表单
     */
    onSubmit?: (ev: any) => void;
    /**
     *
     * @description 键盘输入事件
     */
    keydown?: (ev: any) => void;
}

export class BaseForm extends React.Component<BaseFormProps, {}> {
    constructor(props: BaseFormProps) {
        super(props);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const col = this.props.col || 1;

        return (
            <Row gutter={8} style={this.props.style}>
                <Form layout={this.props.layout || 'horizontal'}
                    style={this.props.layout === 'inline' ? { margin: '0 4px' } : {}}
                    onSubmit={this.props.onSubmit}
                    onKeyDown={e => this.props.keydown && this.props.keydown(e)} >
                    {
                        _.map(this.props.item, (item: BaseFormItem, i: number) => {
                            if (item.hide) {
                                return;
                            }
                            const component = this.getComponent(item);

                            const itemEL = (
                                <span>
                                    {
                                        item.formItem !== undefined && !item.formItem ?
                                            component :
                                            <Form.Item
                                                {...this.getItemProps(item)}
                                            >
                                                {getFieldDecorator(item.key, this.getOption(item))(
                                                    component,
                                                )}
                                            </Form.Item>
                                    }
                                </span>
                            );

                            if (this.props.layout === 'inline') {
                                return (
                                    <span key={i}>
                                        {itemEL}
                                    </span>
                                );
                            }

                            return (
                                <Col key={i}
                                    span={24 / col}>
                                    {itemEL}
                                </Col>
                            );
                        })
                    }
                </Form>
            </Row>
        );
    }

    private getOption = (item: BaseFormItem): GetFieldDecoratorOptions => {
        const option: GetFieldDecoratorOptions = {
            rules: [{ required: !!item.required, message: this.getMessage(item) }],
            initialValue: item.initialValue,
        };
        if (item.fieldDecoratorOptions) {
            _.assign(option, item.fieldDecoratorOptions);
        }
        return option;
    }

    private getComponent = (item: BaseFormItem): JSX.Element => {
        if (item.component) {
            return item.component;
        }

        const placeholder = item.name ? item.name : item.itemProps && item.itemProps.label ? item.itemProps.label : '';

        let component = (<Input style={{ width: '100%' }} placeholder={`请输入${placeholder}`} />);

        let props = {};
        if (item.typeComponentProps) {
            props = item.typeComponentProps;
        }

        if (item.type === 'input') {
            props = _.assign({
                style: { width: '100%' },
                placeholder: `请输入${placeholder}`,
            }, props);
            component = (<Input {...props} />);
        } else if (item.type === 'inputNumber') {
            props = _.assign({
                precision: 2,
                min: 0,
                style: { width: '100%' },
                placeholder: `请输入${placeholder}`,
            }, props);
            component = (<InputNumber {...props} />);
        } else if (item.type === 'textArea') {
            props = _.assign({
                precision: 2,
                min: 0,
                style: { width: '100%' },
                placeholder: `请输入${placeholder}`,
            }, props);
            component = (<Input.TextArea {...props} />);
        } else if (item.type === 'password') {
            props = _.assign({
                style: { width: '100%' },
                placeholder: `请输入${placeholder}`,
            }, props);
            component = (<Input.Password />);
        } else if (item.type === 'select' || item.type === 'selectMulti') {
            props = _.assign({
                style: { width: '100%' },
                placeholder: `请输入${placeholder}`,
                getPopupContainer: () => document.getElementById('fixSelect'),
                allowClear: true,
                mode: item.type === 'selectMulti' ? 'multiple' : '',
            }, props);
            component = (
                <Select {...props}>{(item.options || []).map((r: any, i) => <Option key={i} value={r.value}>{r.label}</Option>)}</Select>
            );
        } else if (item.type === 'checkbox') {
            props = _.assign({
                options: item.options.length > 0 ? item.options : undefined || [],
            }, props);
            component = (<CheckboxGroup {...props} />);
        } else if (item.type === 'switch') {
            props = _.assign({
                checkedChildren: item.options[0].label,
                unCheckedChildren: item.options[1].label,
            }, props);
            component = (<Switch {...props} />);
        } else if (item.type === 'datePicker') {
            component = (<DatePicker {...props} />);
        } else if (item.type === 'rangePicker') {
            component = (<RangePicker {...props} />);
        }

        return component;
    }

    private getMessage = (item: BaseFormItem): string => {
        if (item.message) {
            return item.message;
        }

        const name = item.name ? item.name : item.itemProps && item.itemProps.label ? item.itemProps.label : '';

        let messageText = `${name}必填`;

        switch (item.type) {
            case 'input': {
                messageText = `请输入${name}`;
                break;
            }
            case 'select': {
                messageText = `请选择${name}`;
                break;
            }
        }

        return messageText;
    }

    private getItemProps = (item: BaseFormItem): FormItemProps => {
        const subFormItemLayout = item.formItemLayout || this.props.formItemLayout || {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 12 },
            },
        };

        const itemProps: FormItemProps = {
            colon: true,
            hasFeedback: true,
            ...subFormItemLayout,
        };

        if (item.itemProps) {
            _.assign(itemProps, item.itemProps);
        }

        return itemProps;
    }
}
