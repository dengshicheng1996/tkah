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
import {staticImgURL} from 'common/staticURL';
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
                values.mobile = values.phone;
                if (this.forget) {
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
                        message.success('修改成功');
                        $.cookie('token', res.data.token, { path: '/' });
                        this.props.auth.status.state = 'user';
                        this.props.history.push('/management/home');
                    } else {
                        message.error(res.message);
                    }
                    return;
                }
                this.props.auth.login(values).then((r: any) => {
                    if (r.kind === 'result') {
                        if (r.result.status_code !== 200) {
                            message.error(r.result.message);
                        }
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
            <div style={{ backgroundImage: `url(${staticImgURL('bg.png')})`, paddingTop: '15%', width: '100%', height: '100%' }}>
                <Row gutter={16}>
                    <Col span={12} offset={6}>
                        <div style={{textAlign: 'center', fontSize: '42px', color: '#fff', marginBottom: '10px'}}>智能管理后台系统</div>
                        <Card bordered={false} style={{ margin: '0 auto', maxWidth: '400px', borderRadius: '10px' }}>
                            <div style={{borderBottom: '3px solid #E46322', width: '64px', fontSize: '16px', fontWeight: 700, margin: '0 0 30px 10px'}}>{ !this.forget ? '用户登陆' : '找回密码'}</div>
                            <Form onSubmit={this.handleSubmit} className='login-form' style={{ margin: '10px' }}>
                                <FormItem>
                                    {getFieldDecorator('phone', {
                                        rules: [{ required: true, message: '请输入您的手机号!' }],
                                        initialValue: this.phone,
                                    })(
                                        <Input prefix={<Icon type='mobile' style={{ color: 'rgba(0,0,0,.25)' }} />} style={{height: 40}} placeholder='请输入您的手机号' />,
                                    )}
                                </FormItem>
                                {
                                    this.forget
                                        ?
                                        <FormItem>
                                            {getFieldDecorator('code', {
                                                rules: [{ required: true, message: '验证码' }],
                                            })(
                                                <Input style={{width: 200, height: 40}}  type='input' placeholder='' />,
                                            )}
                                            <Button style={{marginLeft: 30, height: 40}} onClick={() => this.vCode()}>{this.time >= 0 ? this.time + '秒' : '发送验证码'}</Button>
                                        </FormItem>
                                        :
                                        ''
                                }
                                <FormItem>
                                    {getFieldDecorator('password', {
                                        rules: [{ required: true, message: '请输入您的密码!' }],
                                        initialValue: this.password,
                                    })(
                                        <Input prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />} style={{height: 40}} type='password' placeholder='请输入您的密码！' />,
                                    )}
                                </FormItem>
                                <div style={{textAlign: 'right'}}>
                                    <a onClick={() => this.forget = !this.forget}>{this.forget ? '返回' : '忘记密码'}</a>
                                </div>
                                <Button type='primary' style={{ width: '100%', marginTop: 20, background: '#E46322', height: '40px', border: '1px solid #E46322', borderRadius: '7px'}} htmlType='submit' className='login-form-button'>
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
