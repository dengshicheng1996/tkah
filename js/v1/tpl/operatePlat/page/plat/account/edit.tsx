import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { mutate, Querier } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
import * as _ from 'lodash';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { WithAppState, withAppState } from 'operatePlat/common/appStateStore';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
const FormItem = Form.Item;

interface Props {
    form: WrappedFormUtils;
}

@Radium
@observer
export class EditView extends React.Component<RouteComponentProps<any> & WithAppState & Props, {}> {
    query: Querier<any, any> = new Querier(null);
    rolesQuery: Querier<any, any> = new Querier(null);
    disposers: Array<() => void> = [];

    @observable private resultData?: any = {};
    @observable private rolesData?: any[] = [];
    @observable private loading?: boolean = false;

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        this.disposers.push(autorun(() => {
            this.rolesQuery.setReq({
                url: `/api/crm/allroles`,
                method: 'get',
            });
        }));

        this.disposers.push(autorun(() => {
            this.loading = this.rolesQuery.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.rolesQuery.result, 'result.data') as any) || {};
        }, searchData => {
            this.rolesData = searchData;
        }));

        if (!this.props.match.params.id) {
            return;
        }

        this.disposers.push(autorun(() => {
            this.query.setReq({
                url: `/api/crm/users/${this.props.match.params.id}`,
                method: 'get',
            });
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || {};
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    render() {
        const item: BaseFormItem[] = [
            {
                type: 'input',
                key: 'mobile',
                itemProps: {
                    label: '手机号',
                },
                typeComponentProps: { disabled: !!this.props.match.params.id },
                initialValue: this.resultData.mobile,
                fieldDecoratorOptions: {
                    rules: [
                        { required: true, message: '请输入手机号', whitespace: true },
                        {
                            validator: (rule, value, callback) => {
                                const reg = new RegExp(regular.phone_number.reg);
                                if (!reg.test(value) && value) {
                                    callback('格式错误，请输入正确的手机号');
                                    return;
                                }
                                callback();
                            },
                        },
                    ],
                },
            },
            {
                type: 'input', key: 'username',
                itemProps: {
                    label: '用户名',
                },
                initialValue: this.resultData.username, hide: !this.props.match.params.id,
            },
            {
                type: 'password',
                key: 'password',
                itemProps: {
                    label: '密码',
                },
                initialValue: this.resultData.password,
                fieldDecoratorOptions: {
                    rules: [
                        { required: true, message: '请输入密码', whitespace: true },
                        {
                            validator: (rule, value, callback) => {
                                const reg = new RegExp(regular.password.reg);
                                if (!reg.test(value) && value) {
                                    callback('格式错误，请输入6-20位数字/字符');
                                    return;
                                }
                                callback();
                            },
                        },
                    ],
                },
            },
            {
                type: 'select',
                key: 'role_id',
                itemProps: {
                    label: '角色',
                },
                initialValue: this.resultData.role_id,
                options: this.rolesData,
            },
            {
                formItem: false, component: this.subBtn(),
            },
        ];

        return (
            <Spin spinning={this.loading}>
                <div style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    padding: 24,
                }}>
                    {
                        this.props.match.params.id ?
                            '修改账户信息' : '新增账户信息'
                    }
                </div>
                <br />
                <BaseForm form={this.props.form} item={item} onSubmit={this.handleSubmit} />
            </Spin>
        );
    }

    private handleSubmit = (ev: any) => {
        ev.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.loading = true;
                const json: any = _.assign({}, values);
                let url: string = '/api/crm/users';

                if (this.props.match.params.id) {
                    url = `/api/crm/users/${this.props.match.params.id}/edit`;
                }

                mutate<{}, any>({
                    url,
                    method: this.props.match.params.id ? 'put' : 'post',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.info('操作成功', 0.5, () => {
                            this.props.history.push(`/operatePlat/account`);
                        });

                        return;
                    }
                    message.warn(r.message);
                }, error => {
                    this.loading = false;
                    Modal.error({
                        title: '警告',
                        content: `Error: ${JSON.stringify(error)}`,
                    });
                });
            }
        });
    }

    private subBtn = (): JSX.Element => {
        return (
            <FormItem
                wrapperCol={{
                    xs: { span: 24, offset: 0 },
                    sm: { span: 19, offset: 5 },
                }}>
                <Button type='primary' htmlType='submit'>确定</Button>
                <Button
                    style={{ margin: '0 0 0 10px' }}
                    onClick={() => { this.props.history.push(`/operatePlat/account`); }}>取消</Button>
            </FormItem>
        );
    }

}

const formCreate = Form.create()(withRouter(withAppState(EditView)));

export const Edit = formCreate;
