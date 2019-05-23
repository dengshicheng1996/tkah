import { InputItemProps } from 'antd-mobile/lib/input-item';
import { GetFieldDecoratorOptions } from 'antd/lib/form/Form';
import { InputItem } from 'common/antd/mobile/input-item';
import { List } from 'common/antd/mobile/list';
import { Picker } from 'common/antd/mobile/picker';
import { Toast } from 'common/antd/mobile/toast';
import * as _ from 'lodash';
import * as React from 'react';

export interface OptionType {
    label?: any;
    value?: any;
    children?: OptionType[];
    disabled?: boolean;
    onChange?: (e: any) => void;
}

interface ComponentProps {
    component?: JSX.Element;
    typeComponentProps?: InputItemProps;
    options?: OptionType[];
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
            }, props);

            component = (
                <InputItem
                    {...fieldProps}
                    clear
                    type={item.key}
                    error={!!getFieldError(item.key)}
                    onErrorClick={() => {
                        if (getFieldError(item.key)) {
                            Toast.info(getFieldError(item.key)[0]);
                        }
                    }}
                >{item.itemProps.label}</InputItem>
            );
        } else if (item.type === 'select') {
            // component = (
            //     <Picker data={(() => {
            //         const RiskData = [];
            //         Risk.forEach((item, index) => {
            //             RiskData.push({
            //                 value: item.key,
            //                 label: item.value,
            //             });
            //         });
            //         return RiskData;
            //     })()}
            //         cols={1}
            //         value={[this.props.data.gaokaoScoreState.userInfo.risk || '']}
            //         onOk={(val) => {
            //             this.setRisk(val[0]);
            //         }}>
            //         <List.Item arrow="horizontal">Multiple & cascader</List.Item>
            //     </Picker>
            // );
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
