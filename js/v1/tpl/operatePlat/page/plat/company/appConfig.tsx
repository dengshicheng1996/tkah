import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Collapse } from 'common/antd/collapse';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { mutate, Querier } from 'common/component/restFull';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
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
                url: `/api/crm/appversion/${this.props.match.params.id}`,
                method: 'get',
            });
        }));

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || {};
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    getPanel = () => {
        const android: Array<TypeFormItem | ComponentFormItem> = [
            { type: 'input', key: 'androidVersion', itemProps: { label: '版本号' }, initialValue: this.resultData.androidVersion, required: true },
            {
                type: 'input', key: 'androidUrl', itemProps: { label: '下载链接' },
                initialValue: this.resultData.androidUrl,
                fieldDecoratorOptions: {
                    rules: [
                        { required: true, message: '请输入下载链接', whitespace: true },
                        {
                            validator: (rule, value, callback) => {
                                const reg = new RegExp(regular.url.reg);
                                if (!reg.test(value) && value) {
                                    callback('格式错误，请输入链接');
                                    return;
                                }
                                callback();
                            },
                        },
                    ],
                },
            },
            {
                type: 'switch',
                key: 'androidForcedUpdate',
                itemProps: {
                    label: '是否强制更新',
                    hasFeedback: false,
                },
                initialValue: !!_.get(this.resultData, 'androidForcedUpdate'),
                fieldDecoratorOptions: {
                    valuePropName: 'checked',
                },
                options: [
                    {
                        label: '开启',
                        value: 1,
                    },
                    {
                        label: '关闭',
                        value: 0,
                    },
                ],
            },
        ];

        const ios: Array<TypeFormItem | ComponentFormItem> = [
            { type: 'input', key: 'iosVersion', itemProps: { label: '版本号' }, initialValue: this.resultData.iosVersion, required: true },
            {
                type: 'input', key: 'iosUrl', itemProps: { label: '下载链接' },
                initialValue: this.resultData.iosUrl,
                fieldDecoratorOptions: {
                    rules: [
                        { required: true, message: '请输入下载链接', whitespace: true },
                        {
                            validator: (rule, value, callback) => {
                                const reg = new RegExp(regular.url.reg);
                                if (!reg.test(value) && value) {
                                    callback('格式错误，请输入链接');
                                    return;
                                }
                                callback();
                            },
                        },
                    ],
                },
            },
            {
                type: 'switch',
                key: 'iosForcedUpdate',
                itemProps: {
                    label: '是否强制更新',
                    hasFeedback: false,
                },
                initialValue: !!_.get(this.resultData, 'iosForcedUpdate'),
                fieldDecoratorOptions: {
                    valuePropName: 'checked',
                },
                options: [
                    {
                        label: '开启',
                        value: 1,
                    },
                    {
                        label: '关闭',
                        value: 0,
                    },
                ],
            },
        ];
        return [
            { header: 'Android配置', item: android },
            { header: 'IOS配置', item: ios },
        ];
    }

    render() {
        const panel = this.getPanel();

        return (
            <Spin spinning={this.loading}>
                <div style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    padding: 24,
                }}>
                    App 配置
                </div>
                <Collapse defaultActiveKey={_.keys(panel)}>
                    {
                        panel.map((r, i) => {
                            return (
                                <Collapse.Panel header={r.header} key={`${i}`}>
                                    <BaseForm form={this.props.form} item={r.item} />
                                </Collapse.Panel>
                            );
                        })
                    }
                </Collapse>
                <BaseForm style={{ margin: '20px 0' }} form={this.props.form} item={[
                    {
                        formItem: false, component: this.subBtn(),
                    },
                ]} onSubmit={this.handleSubmit} />
            </Spin>
        );
    }

    private handleSubmit = (ev: any) => {
        ev.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.loading = true;

                mutate<{}, any>({
                    url: `/api/crm/appversion/${this.props.match.params.id}`,
                    method: 'put',
                    variables: values,
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
