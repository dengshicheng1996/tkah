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
    @observable private loading = false;

    constructor(props: any) {
        super(props);
    }

    render() {
        const item: BaseFormItem[] = [
            { type: 'input', key: 'name', itemProps: { label: '充值金额' }, required: true },
            { type: 'textArea', key: 'short_name', itemProps: { label: '备注' }, required: true },
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
                    充值查询费
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
                    chargeCid: this.props.match.params.id,
                });
                const url: string = '/api/crm/payment/chargeselect';

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
