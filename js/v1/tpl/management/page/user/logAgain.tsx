import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import {Modal} from 'common/antd/modal';
import { withAuth, WithAuth } from 'common/component/auth';
import {mutate} from 'common/component/restFull';
import {staticImgURL} from 'common/staticURL';
import {getUrlSearch} from 'common/tools';
import * as $ from 'jquery';
import { observable, toJS } from 'mobx';
import * as React from 'react';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';

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
    @observable private time: number = 3;
    @observable private loginFastCode: any = getUrlSearch()['loginFastCode'];
    constructor(props: any) {
        super(props);
    }
    async componentDidMount() {
        const date = setInterval(() => {
            const time: number = this.time;
            if (time === 0) {
                clearInterval(date);
                this.props.history.push('/management/user/login');
            } else {
                this.time = time - 1;
            }
        }, 1000);
    }
    render() {
        const status = toJS(this.props.auth.status);
        if (status.state === 'user') {
            this.props.history.push(this.props.location.query && this.props.location.query.next ? this.props.location.query.next : '/management/home');
        }

        const { getFieldDecorator } = this.props.form;
        return (
            <div style={{ backgroundImage: `url(${staticImgURL('bg.png')})`, paddingTop: '15%', width: '100%', height: '100%' }}>
                <div style={{textAlign: 'center', color: '#fff', fontSize: '20px'}}>
                    您的账户在其他地方登陆，您已被强制下线
                    <p>{this.time}秒后跳转到登陆页</p>
                    <p><Link to={'/management/user/login'}>立即跳转登陆页</Link></p>
                </div>
            </div>
        );

    }
}
const FormCreate: any = Form.create()(withRouter(withAuth(LoginView)) as any);
export const logAgain = FormCreate;
