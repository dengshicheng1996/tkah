import { InputItemProps } from 'antd-mobile/lib/input-item';
import { PickerData } from 'antd-mobile/lib/picker/PropsType';
import { GetFieldDecoratorOptions } from 'antd/lib/form/Form';
import { Icon } from 'common/antd/mobile/icon';
import { InputItem } from 'common/antd/mobile/input-item';
import { List } from 'common/antd/mobile/list';
import { Picker } from 'common/antd/mobile/picker';
import { Toast } from 'common/antd/mobile/toast';
import { ErrorSvg } from 'common/component/svg';
import * as _ from 'lodash';
import * as React from 'react';
import { style } from 'typestyle';

export interface OptionType extends PickerData {
    disabled?: boolean;
    onChange?: (e: any) => void;
}

interface ComponentProps {
    component?: JSX.Element;
    typeComponentProps?: InputItemProps;
    options?: OptionType[] | OptionType[][];
}

export interface BaseFormItem extends ComponentProps {
    key?: string;
    type?: string;
    name?: string;
    hide?: boolean;
    fieldDecoratorOptions?: GetFieldDecoratorOptions;
    itemProps?: any;
    initialValue?: any;
    required?: boolean;
    message?: string;
}

interface BaseFormProps {
    style?: React.CSSProperties;
    form: any;
    item: BaseFormItem[];
    onSubmit?: (ev: any) => void;
    keydown?: (ev: any) => void;
}

export class BaseForm extends React.Component<BaseFormProps, {}> {
    constructor(props: BaseFormProps) {
        super(props);
    }

    render() {
        const { getFieldProps, getFieldError } = this.props.form;

        return (
            <List style={this.props.style}>
                {
                    _.map(this.props.item, (item: BaseFormItem, i: number) => {
                        if (item.hide) {
                            return;
                        }
                        const component = this.getComponent(item, getFieldProps, getFieldError);

                        return (
                            <div key={i}>{component}</div>
                        );
                    })
                }
            </List>
        );
    }

    private getComponent = (item: BaseFormItem, getFieldProps: any, getFieldError: any): JSX.Element => {
        if (item.component) {
            return item.component;
        }

        const placeholder = item.name ? item.name : item.itemProps && item.itemProps.label ? item.itemProps.label : '';

        let component = (<div />);

        const fieldProps = getFieldProps(item.key, this.getOption(item));

        let props = {};
        if (item.typeComponentProps) {
            props = item.typeComponentProps;
        }

        if (item.type === 'input') {
            props = _.assign({
                placeholder: `请输入${placeholder}`,
                style: {
                    textAlign: 'right',
                },
            }, props);

            component = (
                <InputItem
                    {...props}
                    {...fieldProps}
                    clear
                    type='text'
                    error={!!getFieldError(item.key)}
                    onErrorClick={() => {
                        if (getFieldError(item.key)) {
                            Toast.info(getFieldError(item.key)[0]);
                        }
                    }}
                >{item.itemProps.label}</InputItem>
            );
        } else if (item.type === 'select') {
            props = _.assign({
                extra: `请输入${placeholder}`,
            }, props);
            component = (
                <Picker {...props}
                    {...fieldProps}
                    format={(labels: React.ReactNode[]) => {
                        if (getFieldError(item.key)) {
                            return (
                                <div className={style({
                                    position: 'relative',
                                    paddingRight: '27px',
                                })}>
                                    <span>{labels.length > 0 ? labels : placeholder}</span>
                                    <ErrorSvg className={style({
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                    })} onClick={(ev: any) => {
                                        ev.preventDefault();
                                        ev.stopPropagation();
                                        if (getFieldError(item.key)) {
                                            Toast.info(getFieldError(item.key)[0]);
                                        }
                                    }} />
                                </div>
                            );
                        }
                        return labels.length > 0 ? labels : placeholder;
                    }}
                    data={item.options}>
                    <List.Item arrow='horizontal'>{item.itemProps.label}</List.Item>
                </Picker>
            );
        }

        return component;
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
}
