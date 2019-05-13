import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import { Radium } from 'common/radium';
import { mutate, Querier } from 'common/restFull';
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
            { type: 'input', key: 'mobile', label: '手机号', disabled: true, initialValue: this.resultData.mobile },
            { type: 'input', key: 'username', label: '用户名', initialValue: this.resultData.username },
            { type: 'password', key: 'password', label: '密码', initialValue: this.resultData.password },
            { type: 'select', key: 'role', label: '角色', initialValue: this.resultData.role_id, options: [] },
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
                let url: string = 'api/crm/users';

                if (this.props.match.params.id) {
                    url = `api/crm/users/${this.props.match.params.id}/edit`;
                }

                mutate<{}, any>({
                    url,
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.info('操作成功', 1, () => {
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

const formCreate = Form.create()(withAppState(EditView));

export const Edit = withRouter(formCreate);
