import { message, Button, Col, Input, Row } from 'antd';
import { regular } from 'common/regular';
import { POST } from 'common/tools';
import * as _ from 'lodash';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

interface VerifyCodeProps {
    value?: any;
    form?: any;
    onChange?: any;
    item: any;
}

@observer
export class VerifyCode extends React.Component<VerifyCodeProps, {}> {
    @observable private timer: number = 0;
    @observable private text: string = '点击获取';

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Row gutter={8}>
                <Col span={12}>
                    <Input style={{ width: '100%' }} defaultValue={this.props.value} onChange={(e) => {
                        this.props.onChange(e.target.value);
                    }} />
                </Col>
                <Col span={12}>
                    <Button type='primary'
                        disabled={!(this.timer === 0 || this.timer > 59)}
                        onClick={() => {
                            if (this.timer <= 0) {
                                this.reSendCode(true, this.props.item.phoneKey);
                            }
                        }}>{this.timer === 0 || this.timer > 59 ? this.text : `${this.timer}s`}</Button>
                </Col>
            </Row>
        );
    }

    private reSendCode = (reTimer: boolean, phoneKey: string) => {
        if (reTimer) {
            const phone = this.props.form.getFieldValue(phoneKey);
            const reg = new RegExp(regular.phone_number.reg);

            if (!phone) {
                const json = {};
                json[phoneKey] = {
                    value: phone,
                    errors: [new Error('请输入手机号')],
                };
                this.props.form.setFields(json);
                return;
            }

            if (!reg.test(phone)) {
                const json = {};
                json[phoneKey] = {
                    value: phone,
                    errors: [new Error('格式错误（请输入正确的手机号）')],
                };
                this.props.form.setFields(json);
                return;
            }

            const postData = {
                url: 'sendVerifyCode',
                values: { phone },
            };
            this.timer = 61;
            this.text = '重新获取';

            POST('/manage/interface', postData, (resData) => {
                message.success('发送成功');
            }, (err) => {
                message.error(err);
            });
        }
        if (this.timer > 0) {
            this.timer -= 1;
            setTimeout(() => {
                this.reSendCode(false, phoneKey);
            }, 1000);
        }
    }
}
