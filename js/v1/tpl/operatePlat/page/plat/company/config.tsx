import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { BaseCollapse, BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
import { mutate, Querier } from 'common/restFull';
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
        this.disposers.push(autorun(() => {
            this.query.setReq({
                url: `/api/crm/companys/${this.props.match.params.id}/configs`,
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
        const item: Array<BaseFormItem | BaseCollapse> = [
            {
                key: 'base',
                title: 'aaaaa',
            },
            {
                formItem: false, component: this.subBtn(),
            },
            { type: 'input', key: 'name', label: '公司名', initialValue: this.resultData.name, required: true },
            { type: 'input', key: 'short_name', label: '公司简称', initialValue: this.resultData.short_name, required: true },
            {
                type: 'input',
                key: 'mobile',
                label: '主账号',
                initialValue: this.resultData.mobile,
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
            {
                type: 'select',
                key: 'is_test',
                label: '是否测试公司	',
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
                    修改公司配置项
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

                mutate<{}, any>({
                    url: `crm/companys/${this.props.match.params.id}/configs`,
                    method: 'put',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.info('操作成功', 1, () => {
                            this.props.history.push(`/operatePlat/companys`);
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
