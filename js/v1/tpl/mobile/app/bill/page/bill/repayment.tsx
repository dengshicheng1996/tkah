import { Button } from 'common/antd/mobile/button';
import { Toast } from 'common/antd/mobile/toast';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/mobile/baseForm';
import { regular } from 'common/regular';
import { staticBaseURL } from 'common/staticURL';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { createForm } from 'rc-form';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';
import { Frame } from './frame';
import { ModalBank } from './modal/bank';

export class RepaymentView extends React.Component<RouteComponentProps<any> & WithAppState & { form: any }, {}> {

    constructor(props: any) {
        super(props);
    }

    render() {
        const formItem: BaseFormItem[] = [
            {
                key: 'cardId',
                component: (
                    <div style={{ margin: '0 15px 7px', fontSize: '15px' }}>
                        <span>银行卡</span>
                        <span style={{
                            fontSize: '12px',
                            borderRadius: '3px',
                            border: '1px solid rgba(229,88,0,1)',
                            color: 'rgba(229,88,0,1)',
                            padding: '1px 3px',
                            marginLeft: '5px',
                        }}>必填</span>
                    </div>
                ),
            },
            {
                key: 'cardId',
                type: 'inputBankCard',
                typeComponentProps: { cols: 1, style: { textAlign: 'left' }, placeholder: '请输入银行卡' },
                required: true,
            },
            {
                key: 'phone',
                component: (
                    <div style={{ margin: '10px 15px 7px', fontSize: '15px' }}>
                        <span>预留手机号</span>
                        <span style={{
                            fontSize: '12px',
                            borderRadius: '3px',
                            border: '1px solid rgba(229,88,0,1)',
                            color: 'rgba(229,88,0,1)',
                            padding: '1px 3px',
                            marginLeft: '5px',
                        }}>必填</span>
                    </div>),
            },
            {
                key: 'phone',
                type: 'inputPhone',
                typeComponentProps: { cols: 1, style: { textAlign: 'left' }, placeholder: '请输入手机号' },
                fieldDecoratorOptions: {
                    rules: [
                        {
                            required: true,
                            message: '请输入手机号',
                        },
                        {
                            validator: (rule: any, value: any, callback: any) => {
                                if (!value) {
                                    callback('请输入手机号');
                                    return;
                                }
                                const reg = new RegExp(regular.phone_number.reg);
                                if (!reg.test(value.replace(/\s+/g, '')) && value) {
                                    callback('格式错误，请正确输入手机号');
                                    return;
                                }
                                callback();
                            },
                        },
                    ],
                },
                required: true,
            },
        ];
        return (
            <Frame title='绑定银行卡'
                bg={staticBaseURL('bg_card.png')}
                fullHeight={true}
                footer={(
                    <div style={{ padding: '10px 0' }}>
                        <Button type='primary'
                            onClick={this.handleSubmit}>提交</Button>
                    </div>
                )}>
                <RadiumStyle scopeSelector={['.bill']}
                    rules={{
                        '.am-list-body::before, .am-list-body::after,.am-list-body div .am-list-line::after': {
                            height: '0px !important',
                        },
                        '.am-list-line': {
                            border: '1px solid rgba(151,151,151,0.16) !important',
                            background: 'rgba(247,247,247,1)',
                            borderRadius: '5px',
                            padding: '12px 10px',
                        },
                    }} />
                <div className={style({
                    margin: '0 -20px',
                })}>
                    <BaseForm form={this.props.form}
                        item={formItem} />
                </div>
                {/* <ModalBank /> */}
            </Frame>
        );
    }

    private handleSubmit = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                console.log(values);
            }
        });
    }

}

const FormCreate = createForm()(withRouter(withAppState(RepaymentView)));

export const Repayment = FormCreate;
