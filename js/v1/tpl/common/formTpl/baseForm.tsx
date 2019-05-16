import { CheckboxOptionType } from 'antd/lib/checkbox/Group';
import { FormItemProps } from 'antd/lib/form';
import { FormLayout, GetFieldDecoratorOptions, ValidationRule, WrappedFormUtils } from 'antd/lib/form/Form';
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
import { getSeparator } from '../tools';

const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;

export interface BaseFormItem {
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
    disabled?: boolean;
    placeholder?: string;
    options?: CheckboxOptionType[] | Array<{ value: any, label: any }>;
    message?: string;
    component?: JSX.Element;
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
                                <Col key={i} style={{ maxHeight: '64px' }} span={24 / col}>
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

        let component = (<Input style={{ width: '100%' }} placeholder={item.placeholder || `请输入${placeholder}`} disabled={item.disabled} />);
        if (item.type === 'input') {
            component = (<Input style={{ width: '100%' }} placeholder={item.placeholder || `请输入${placeholder}`} disabled={item.disabled} />);
        } else if (item.type === 'inputNumber') {
            component = (<InputNumber precision={2} min={0} style={{ width: '100%' }} placeholder={item.placeholder || `请输入${placeholder}`} disabled={item.disabled} />);
        } else if (item.type === 'password') {
            component = (<Input.Password style={{ width: '100%' }} placeholder={item.placeholder || `请输入${placeholder}`} disabled={item.disabled} />);
        } else if (item.type === 'select' || item.type === 'selectMulti') {
            component = (
                <Select
                    getPopupContainer={() => document.getElementById('fixSelect')}
                    style={{ width: '100%' }}
                    disabled={item.disabled}
                    placeholder={item.placeholder || `请选择${placeholder}`}
                    allowClear={true}
                    mode={item.type === 'selectMulti' ? 'multiple' : ''}
                >
                    {
                        (item.options || []).map((r: any, i) => <Option key={i} value={r.value}>{r.label}</Option>)
                    }
                </Select>
            );
        } else if (item.type === 'checkbox') {
            component = (<CheckboxGroup options={item.options.length > 0 ? item.options : undefined || []} disabled={item.disabled} />);
        } else if (item.type === 'switch') {
            component = (<Switch checkedChildren={item.options[0].label} unCheckedChildren={item.options[1].label} />);
        } else if (item.type === 'datePicker') {
            component = (<DatePicker disabled={item.disabled} />);
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
