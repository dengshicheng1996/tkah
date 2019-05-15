import { CheckboxOptionType } from 'antd/lib/checkbox/Group';
import { FormItemProps } from 'antd/lib/form';
import { FormLayout, ValidationRule, WrappedFormUtils } from 'antd/lib/form/Form';
import { Checkbox } from 'common/antd/checkbox';
import { Col } from 'common/antd/col';
import { DatePicker } from 'common/antd/date-picker';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import * as _ from 'lodash';
import * as React from 'react';

const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;

export interface BaseFormItem {
    key?: string;
    type?: string;
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
    formItem?: boolean;
    required?: boolean;
    rules?: ValidationRule[];
    initialValue?: any;
    disabled?: boolean;
    options?: CheckboxOptionType[] | Array<{ value: any, label: any }>;
    placeholder?: string;
    message?: string;
    colon?: boolean;
    hasFeedback?: boolean;
    label?: string;
    name?: string;
    component?: JSX.Element;
    onChange?: any;
}

interface BaseFormProps {
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
}

export class BaseForm extends React.Component<BaseFormProps, {}> {
    constructor(props: BaseFormProps) {
        super(props);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const col = this.props.col || 1;
        return (
            <Row gutter={8}>
                <Form layout={this.props.layout || 'horizontal'}
                    onSubmit={this.props.onSubmit}>
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
                                                {...this.getParams(item)}
                                            >
                                                {getFieldDecorator(item.key, {
                                                    rules: item.rules || [{ required: !!item.required, message: this.getMessage(item) }],
                                                    initialValue: item.initialValue,
                                                })(
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

    private getComponent = (item: BaseFormItem): JSX.Element => {
        if (item.component) {
            return item.component;
        }

        let component = (<Input onChange={(data) => item.onChange && item.onChange(data)} style={{ width: '100%' }} placeholder={item.placeholder || `请输入${item.name || item.label}`} disabled={item.disabled} />);
        if (item.type === 'input') {
            component = (<Input onChange={(data) => item.onChange && item.onChange(data)} style={{ width: '100%' }} placeholder={item.placeholder || `请输入${item.name || item.label}`} disabled={item.disabled} />);
        } else if (item.type === 'password') {
            component = (<Input.Password onChange={(data) => item.onChange && item.onChange(data)} style={{ width: '100%' }} placeholder={item.placeholder || `请输入${item.name || item.label}`} disabled={item.disabled} />);
        } else if (item.type === 'select' || item.type === 'selectMulti') {
            component = (
                <Select
                    getPopupContainer={() => document.getElementById('fixSelect')}
                    style={{ width: '100%' }}
                    disabled={item.disabled}
                    placeholder={item.placeholder || `请选择${item.name || item.label}`}
                    allowClear={true}
                    mode={item.type === 'selectMulti' ? 'multiple' : ''}
                    onChange={(data) => item.onChange && item.onChange(data)}
                >
                    {
                        (item.options || []).map((r, i) => <Option key={i} value={r.value}>{r.label}</Option>)
                    }
                </Select>
            );
        } else if (item.type === 'checkbox') {
            component = (<CheckboxGroup onChange={(data) => item.onChange && item.onChange(data)} options={item.options.length > 0 ? item.options : undefined || []} disabled={item.disabled} />);
        } else if (item.type === 'datePicker') {
            component = (<DatePicker onChange={(data) => item.onChange && item.onChange(data)} disabled={item.disabled} />);
        }

        return component;
    }

    private getMessage = (item: BaseFormItem): string => {
        if (item.message) {
            return item.message;
        }

        const name = item.name || item.label;

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

    private getParams = (item: BaseFormItem): FormItemProps => {
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

        const params: FormItemProps = {
            colon: item.colon !== undefined ? item.colon : true,
            hasFeedback: item.hasFeedback !== undefined ? item.hasFeedback : true,
            label: item.label,
            ...subFormItemLayout,
        };

        return params;
    }
}
