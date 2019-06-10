import { Icon } from 'common/antd/mobile/icon';
import { List } from 'common/antd/mobile/list';
import { Modal } from 'common/antd/mobile/modal';
import { Toast } from 'common/antd/mobile/toast';
import { RadiumStyle } from 'common/component/radium_style';
import { Querier } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/mobile/baseForm';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { createForm } from 'rc-form';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

interface ModalBankProps {
    modal?: boolean;
    phone: string;
    onChangeModal?: () => void;
    onSubmit?: (data: any) => void;
}

@Radium
@observer
class ModalVerifyView extends React.Component<RouteComponentProps<any> & WithAppState & ModalBankProps & { form: any }, {}> {
    constructor(props: any) {
        super(props);
    }

    render() {
        const formItem: BaseFormItem[] = [
            {
                key: 'verifyCode',
                type: 'inputNumber',
                typeComponentProps: {
                    cols: 1,
                    style: {
                        textAlign: 'left',
                    },
                },
                required: true,
            },
        ];

        return (
            <div>
                <RadiumStyle scopeSelector={['.bill']}
                    rules={{
                        '.moda-verify .am-modal-header': {
                            borderBottom: '1px #E5E5E5 solid',
                            padding: '0 15px 8px',
                        },
                        '.moda-verify .am-list-body::before': {
                            height: '0',
                        },
                    }} />
                <Modal
                    visible={this.props.modal}
                    transparent
                    className='moda-verify'
                    title={(
                        <div>
                            <Icon type='cross'
                                color='#666666'
                                size='md'
                                className={style({
                                    position: 'absolute',
                                    left: '15px',
                                    top: '12px',
                                })}
                                onClick={this.props.onChangeModal} />
                            <span>请输入验证码</span>
                        </div>
                    )}
                    maskClosable={false}
                >
                    <div className={style({
                        paddingTop: '15px',
                    })}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 500,
                            color: 'rgba(90,90,90,1)',
                            lineHeight: '21px',
                        }}>验证码已经发送到{this.props.phone}</div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'rgba(152,152,152,1)',
                            lineHeight: '20px',
                            margin: '5px 0 15px',
                        }}>请输入6位验证码</div>
                        <BaseForm form={this.props.form}
                            item={formItem} />
                        <div className={style({
                            marginTop: '20px',
                            background: 'rgba(46,194,95,1)',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '11px',
                            fontSize: '16px',
                        })} onClick={this.handleSubmit}>发送</div>
                    </div>
                </Modal>
            </div>
        );
    }

    private handleSubmit = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.props.onSubmit(values);
            }
        });
    }
}

const FormCreate = createForm()(withRouter(withAppState(ModalVerifyView)));

export const ModalVerify = FormCreate;
