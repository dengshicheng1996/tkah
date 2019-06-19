import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Row } from 'common/antd/row';
import { SearchToObject } from 'common/fun';
import * as $ from 'jquery';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { withAppState, WithAppState } from 'statistics/common/appStateStore';

const FormItem = Form.Item;

interface LoginViewProps {
    form: any;
    location: {
        query: {
            next: string;
        };
    };
}

@observer
class LoginView extends React.Component<RouteComponentProps<any> & WithAppState & LoginViewProps, {}> {
    private search: any = SearchToObject(this.props.location.search);
    private channelId: string = this.search.channel_id || $.cookie('channelId');

    constructor(props: any) {
        super(props);
    }

    handleSubmit = (e: any) => {
        e.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                if (!this.channelId) {
                    message.warning('渠道不存在');
                    return;
                }
                $.cookie('channelId', this.channelId, { path: '/' });
                $.cookie('password', values.password, { path: '/' });
            }
        });
    }

    componentDidMount() {
        if ($.cookie('channelId') && $.cookie('password')) {
            this.props.history.push(this.props.location.query && this.props.location.query.next ? this.props.location.query.next : '/statistics/dc');
        }
    }

    componentDidUpdate() {
        if ($.cookie('channelId') && $.cookie('password')) {
            this.props.history.push(this.props.location.query && this.props.location.query.next ? this.props.location.query.next : '/statistics/dc');
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <div style={{ background: '#ECECEC', paddingTop: '15%', width: '100%', height: '100%' }}>
                <Row gutter={16}>
                    <Col span={12} offset={6}>
                        <Card title='数据统计平台' bordered={false} style={{ margin: '0 auto', maxWidth: '400px' }}>
                            <Form onSubmit={this.handleSubmit} className='login-form' style={{ margin: '10px' }}>
                                <FormItem>
                                    {getFieldDecorator('password', {
                                        rules: [{ required: true, message: '请输入您的密码!' }],
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

const FormCreate = Form.create()(withRouter(withAppState(LoginView)) as any);
export const Login = FormCreate;
