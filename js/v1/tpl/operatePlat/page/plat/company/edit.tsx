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
import * as moment from 'moment';
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
        if (!this.props.match.params.id) {
            return;
        }

        this.disposers.push(autorun(() => {
            this.query.setReq({
                url: `/api/crm/companys/${this.props.match.params.id}`,
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
            { type: 'input', key: 'name', itemProps: { label: '公司名' }, initialValue: this.resultData.name, required: true },
            { type: 'input', key: 'short_name', itemProps: { label: '公司简称' }, initialValue: this.resultData.short_name, required: true },
            { type: 'input', key: 'sms_signature', itemProps: { label: '短信签名' }, initialValue: this.resultData.sms_signature, required: true },
            {
                type: 'input',
                key: 'mobile',
                itemProps: {
                    label: '主账号',
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
                type: 'input',
                key: 'notify_mobile',
                itemProps: {
                    label: '接收通知手机号',
                },
                initialValue: this.resultData.notify_mobile,
                fieldDecoratorOptions: {
                    rules: [
                        { required: true, message: '请输入接收通知手机号', whitespace: true },
                        {
                            validator: (rule, value, callback) => {
                                const reg = new RegExp(regular.phone_number.reg);
                                if (!reg.test(value) && value) {
                                    callback('格式错误，请输入正确的接收通知手机号');
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
                key: 'is_test',
                itemProps: {
                    label: '是否测试公司',
                },
                initialValue: this.resultData.is_test,
                options: [
                    {
                        label: '是',
                        value: 1,
                    },
                    {
                        label: '否',
                        value: 0,
                    },
                ],
            },
            {
                type: 'datePicker',
                key: 'expired_at',
                itemProps: {
                    label: '有效期',
                },
                initialValue: this.resultData.expired_at ? moment(this.resultData.expired_at) : undefined,
                required: true,
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
                            '修改公司信息' : '新增公司信息'
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
                const json: any = _.assign({}, values, {
                    expired_at: values.expired_at.format('YYYY-MM-DD'),
                });
                let url: string = '/api/crm/companys';

                if (this.props.match.params.id) {
                    url = `/api/crm/companys/${this.props.match.params.id}/edit`;
                }

                mutate<{}, any>({
                    url,
                    method: this.props.match.params.id ? 'put' : 'post',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.info('操作成功', 0.5, () => {
                            this.props.history.push(`/operatePlat/company`);
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
                    onClick={() => { this.props.history.push(`/operatePlat/company`); }}>取消</Button>
            </FormItem>
        );
    }

}

const formCreate = Form.create()(withRouter(withAppState(EditView)));

export const Edit = formCreate;
