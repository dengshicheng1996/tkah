import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import {Modal} from 'common/antd/modal';
import { Row } from 'common/antd/row';
import { withAuth, WithAuth } from 'common/component/auth';
import {mutate} from 'common/component/restFull';
import * as $ from 'jquery';
import { observable, toJS } from 'mobx';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

const FormItem = Form.Item;

interface LoginViewProps {
    form: any;
    location: {
        query: {
            next: string;
        };
    };
}

class LoginView extends React.Component<RouteComponentProps<any> & WithAuth & LoginViewProps, {}> {
    @observable private loading: boolean = false;
    @observable private phone: number;
    @observable private password: number;
    @observable private forget: boolean = false;
    @observable private time: number = -1;

    constructor(props: any) {
        super(props);
    }
    vCode() {
        if (this.time >= 0) {
            return false;
        }
        this.props.form.validateFields(async (err: any, values: any) => {
            const json = {
                mobile: values.phone,
            };
            const res: any = await mutate<{}, any>({
                url: '/api/reset/password/code',
                method: 'post',
                variables: json,
            }).catch((error: any) => {
                Modal.error({
                    title: '警告',
                    content: `Error: ${JSON.stringify(error)}`,
                });
                return {};
            });
            if (res.status_code === 200) {
                message.success('发送成功');
                this.time = 120;
                const time = setInterval(() => {
                    if (this.time < 0) {
                        clearInterval(time);
                    } else {
                        this.time --;
                    }
                }, 1000);
            } else {
                message.error(res.message);
            }
        });
    }
    handleSubmit = (e: any) => {
        e.preventDefault();
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                if (this.forget) {
                    values.mobile = values.phone;
                    const res: any = await mutate<{}, any>({
                        url: '/api/reset/password',
                        method: 'post',
                        variables: values,
                    }).catch((error: any) => {
                        Modal.error({
                            title: '警告',
                            content: `Error: ${JSON.stringify(error)}`,
                        });
                        return {};
                    });
                    if (res.status_code === 200) {
                        $.cookie('token', res.data.token, { path: '/' });
                        this.props.history.push('/management/home');
                    } else {
                        message.error(res.message);
                    }
                    return;
                }
                this.props.auth.login(values).then((r) => {
                    if (r.kind === 'result') {
                        return;
                    }
                    message.warning(r.error);
                });
            }
        });
    }

    render() {
        const status = toJS(this.props.auth.status);
        if (status.state === 'user') {
            this.props.history.push(this.props.location.query && this.props.location.query.next ? this.props.location.query.next : '/management/home');
        }

        const { getFieldDecorator } = this.props.form;

        return (
            <div style={{ background: '#ECECEC', paddingTop: '15%', width: '100%', height: '100%' }}>
                <Row gutter={16}>
                    <Col span={12} offset={6}>
                        <Card title='管理平台登录' bordered={false} style={{ margin: '0 auto', maxWidth: '400px' }}>
                            <Form onSubmit={this.handleSubmit} className='login-form' style={{ margin: '10px' }}>
                                <FormItem>
                                    {getFieldDecorator('phone', {
                                        rules: [{ required: true, message: '请输入您的账号!' }],
                                        initialValue: this.phone,
                                    })(
                                        <Input prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder='请输入您的账号' />,
                                    )}
                                </FormItem>
                                {
                                    this.forget
                                        ?
                                        <FormItem>
                                            {getFieldDecorator('code', {
                                                rules: [{ required: true, message: '验证码' }],
                                            })(
                                                <Input style={{width: 200}} type='input' placeholder='' />,
                                            )}
                                            <Button style={{marginLeft: 30}} onClick={() => this.vCode()}>{this.time >= 0 ? this.time + '秒' : '发送验证码'}</Button>
                                        </FormItem>
                                        :
                                        ''
                                }
                                <FormItem>
                                    {getFieldDecorator('password', {
                                        rules: [{ required: true, message: '请输入您的密码!' }],
                                        initialValue: this.password,
                                    })(
                                        <Input prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />} type='password' placeholder='请输入您的密码！' />,
                                    )}
                                </FormItem>
                                <a onClick={() => this.forget = !this.forget}>{this.forget ? '返回' : '忘记密码'}</a>
                                <Button type='primary' style={{ width: '100%', marginTop: 15}} htmlType='submit' className='login-form-button'>
                                    登录
                            </Button>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
        );

    }
}
const FormCreate = Form.create()(withRouter(withAuth(LoginView)) as any);
export const Login = FormCreate;
