import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Row } from 'common/antd/row';
import { withAuth, WithAuth } from 'common/component/auth';
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
    @observable private username: number;
    @observable private password: number;

    constructor(props: any) {
        super(props);
    }

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.props.auth.login(values).then((r: any) => {
                    if (r.kind === 'result' && r.result.data.token) {
                        return;
                    }
                    message.warning(r.error || r.result.message);
                });
            }
        });
    }

    render() {
        const status = toJS(this.props.auth.status);
        if (status.state === 'user') {
            this.props.history.push(this.props.location.query && this.props.location.query.next ? this.props.location.query.next : '/statistics/dc');
        }

        const { getFieldDecorator } = this.props.form;

        return (
            <div style={{ background: '#ECECEC', paddingTop: '15%', width: '100%', height: '100%' }}>
                <Row gutter={16}>
                    <Col span={12} offset={6}>
                        <Card title='数据统计平台' bordered={false} style={{ margin: '0 auto', maxWidth: '400px' }}>
                            <Form onSubmit={this.handleSubmit} className='login-form' style={{ margin: '10px' }}>
                                <FormItem>
                                    {getFieldDecorator('username', {
                                        rules: [{ required: true, message: '请输入您的账号!' }],
                                        initialValue: this.username,
                                    })(
                                        <Input prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder='请输入您的账号' />,
                                    )}
                                </FormItem>
                                <FormItem>
                                    {getFieldDecorator('password', {
                                        rules: [{ required: true, message: '请输入您的密码!' }],
                                        initialValue: this.password,
                                    })(
                                        <Input prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />} type='password' placeholder='请输入您的密码！' />,
                                    )}
                                </FormItem>
                                <Button type='primary' style={{ width: '100%' }} htmlType='submit' className='login-form-button'>
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
