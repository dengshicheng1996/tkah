import { CheckboxOptionType } from 'antd/lib/checkbox/Group';
import { FormItemProps } from 'antd/lib/form';
import { FormLayout, ValidationRule, WrappedFormUtils } from 'antd/lib/form/Form';
import { Checkbox } from 'common/antd/checkbox';
import { Col } from 'common/antd/col';
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
    formItemLayout?: FormLayout;
    formItem?: boolean;
    required?: boolean;
    rules?: ValidationRule[];
    initialValue?: any;
    disabled?: boolean;
    options?: CheckboxOptionType[] | Array<{ value: any, label: any }>;
    message?: string;
    colon?: boolean;
    hasFeedback?: boolean;
    label?: string;
    name?: string;
    component?: React.ReactNode | any;
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
                            const component = this.getComponent(item);

                            return (
                                <Col key={i} style={{ maxHeight: '64px' }} span={24 / col}>
                                    {
                                        item.formItem !== undefined && !item.formItem ?
                                            item.component :
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
            return <item.component item={item} form={this.props.form} />;
        }

        let component = (<Input style={{ width: '100%' }} disabled={item.disabled} />);
        if (item.type === 'input') {
            component = (<Input style={{ width: '100%' }} disabled={item.disabled} />);
        } else if (item.type === 'select' || item.type === 'selectMulti') {
            component = (
                <Select getPopupContainer={() => document.getElementById('fixSelect')}
                    style={{ width: '100%' }}
                    disabled={item.disabled}
                    allowClear={true}
                    mode={item.type === 'selectMulti' ? 'multiple' : ''}>
                    {
                        (item.options || []).map((r, i) => {
                            return (
                                <Option key={i} value={r.value}>{r.label}</Option>
                            );
                        })
                    }
                </Select>
            );
        } else if (item.type === 'checkbox') {
            component = (<CheckboxGroup options={item.options.length > 0 ? item.options : undefined || []} disabled={item.disabled} />);
        }

        return component;
    }

    private getMessage = (item: BaseFormItem): string => {
        if (item.message) {
            return item.message;
        }

        let messageText = `${item.name}必填`;

        switch (item.type) {
            case 'input': {
                messageText = `请输入${item.name}`;
                break;
            }
            case 'select': {
                messageText = `请选择${item.name}`;
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
