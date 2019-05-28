import { DatePickerDecorator } from 'antd/lib/date-picker/interface';
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

export interface OptionType extends AntTreeNodeProps {
    label?: any;
    value?: any;
    children?: OptionType[];
    disabled?: boolean;
    onChange?: (e: any) => void;
}

interface ComponentProps {
    component?: JSX.Element;
    typeComponentProps?: InputProps | SelectProps<any> | InputNumberProps |
    typeof Password | typeof TextArea | typeof Search | typeof Group |
    typeof CheckboxGroup | SwitchProps | DatePickerDecorator | TreeProps | {
        disabled?: boolean;
        placeholder?: string;
    };
    options?: OptionType[];
}

export interface BaseFormItem extends ComponentProps {
    key?: string;
    type?: string;
    name?: string;
    hide?: boolean;
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
    fieldDecoratorOptions?: GetFieldDecoratorOptions;
    itemProps?: FormItemProps;
    initialValue?: any;
    formItem?: boolean;
    required?: boolean;
    message?: string;
}

interface BaseFormProps {
    style?: React.CSSProperties;
    form: WrappedFormUtils;
    item: BaseFormItem[];
    layout?: FormLayout;
    col?: number;
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
    onSubmit?: (ev: any) => void;
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
                    onSubmit={this.props.onSubmit}
                    onKeyDown={e => this.props.keydown && this.props.keydown(e)} >
                    {
                        _.map(this.props.item, (item: BaseFormItem, i: number) => {
                            if (item.hide) {
                                return;
                            }
                            const component = this.getComponent(item);

                            return (
                                <Col key={i}
                                     // style={{ maxHeight: '64px' }}
                                     span={24 / col}>
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
