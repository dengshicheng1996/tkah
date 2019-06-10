import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { Table } from 'common/antd/table';
import { mutate, Querier } from 'common/component/restFull';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
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
export class BankView extends React.Component<RouteComponentProps<any> & WithAppState & Props, {}> {
    private query: Querier<any, any> = new Querier(null);
    private banksQuery: Querier<any, any> = new Querier(null);
    private bankListQuery: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];
    private columns: any[];

    @observable private resultData?: any = {};
    @observable private resultListData?: any = [];
    @observable private resultBanksData?: any = [];
    @observable private infoLoading?: boolean = false;
    @observable private loading?: boolean = false;
    @observable private id?: number;

    @observable private page: number = 1;
    @observable private size: number = 20;

    constructor(props: any) {
        super(props);
        this.setColumns();
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getInfo();
        this.getList();
        this.getBanks();
    }

    getList() {
        this.bankListQuery.setReq({
            url: `/api/crm/payment/brank`,
            method: 'get',
            variables: {
                company_id: this.props.match.params.id,
                page: this.page,
                per_page: this.size,
            },
        });

        this.disposers.push(autorun(() => {
            this.loading = this.bankListQuery.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return {
                company_id: this.props.match.params.id,
                page: this.page,
                per_page: this.size,
            };
        }, searchData => {
            this.query.setReq({
                url: '/api/crm/companys',
                method: 'get',
                variables: {
                    page: this.page,
                    per_page: this.size,
                },
            });
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.bankListQuery.result, 'result.data') as any) || {};
        }, searchData => {
            this.resultListData = searchData;
        }));
    }

    getBanks() {
        this.banksQuery.setReq({
            url: `/api/crm/payment/banks`,
            method: 'get',
        });

        this.disposers.push(reaction(() => {
            return (_.get(this.banksQuery.result, 'result.data') as any) || {};
        }, searchData => {
            this.resultBanksData = searchData;
        }));
    }

    getInfo() {
        this.disposers.push(autorun(() => {
            this.infoLoading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return this.id;
        }, searchData => {
            if (this.id) {
                this.query.setReq({
                    repeat: true,
                    url: `/api/crm/payment/brank/${this.id}`,
                    method: 'get',
                });
            }
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || {};
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    setColumns() {
        this.columns = [
            {
                title: '姓名',
                width: '15%',
                dataIndex: 'name',
            },
            {
                title: '身份证号',
                width: '15%',
                dataIndex: 'id_number',
            },
            {
                title: '银行卡号',
                width: '15%',
                dataIndex: 'bank_num',
            },
            {
                title: '预留手机号',
                width: '15%',
                dataIndex: 'mobile',
            },
            {
                title: '账户类型',
                width: '15%',
                dataIndex: 'type',
                render: (value: number) => {
                    const json: { [key: number]: string } = { 1: '个人账户', 2: '对公账户' };
                    return json[value];
                },
            },
            {
                title: '操作',
                width: '15%',
                key: 'action',
                dataIndex: 'action',
                render: (text: any, record: any, index: any) => (
                    <div>
                        <a href='javascript:;' style={{ display: 'inline-block' }} onClick={() => {
                            this.id = record.id;
                        }} >修改</a>
                        <span style={{ margin: '0 3px' }}>|</span>
                        <a href='javascript:;' style={{ display: 'inline-block' }} onClick={() => {
                            this.del(record.id);
                        }} >删除</a>
                    </div>
                ),
            },
        ];
    }

    render() {
        const item: Array<TypeFormItem | ComponentFormItem> = [
            { type: 'input', key: 'name', itemProps: { label: '姓名' }, initialValue: this.resultData.name, required: true },
            { type: 'input', key: 'id_number', itemProps: { label: '身份证号' }, initialValue: this.resultData.id_number, required: true },
            {
                type: 'select',
                key: 'bank_code',
                itemProps: { label: '银行' },
                initialValue: this.resultData.bank_code,
                required: true,
                options: this.resultBanksData,
                typeComponentProps: {
                    style: {
                        width: '170px',
                    },
                },
            },
            { type: 'input', key: 'bank_num', itemProps: { label: '银行卡号' }, initialValue: this.resultData.bank_num, required: true },
            {
                type: 'input',
                key: 'mobile',
                itemProps: {
                    label: '银行预留手机号',
                },
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
                formItem: false, component: this.subBtn(),
            },
        ];

        const dataSource = (_.get(toJS(this.resultListData), 'list') as any[] || []).map((r, i) => {
            r['key'] = i;
            return r;
        });

        return (
            <Spin spinning={this.loading}>
                <div style={{
                    fontSize: '18px',
                    fontWeight: 400,
                    padding: 24,
                }}>
                    {
                        this.id ?
                            (
                                <span style={{ color: 'blue', fontWeight: 800 }}>修改</span>
                            ) : (
                                <span style={{ color: 'green', fontWeight: 800 }}>新增</span>
                            )
                    }
                    <span>银行卡信息</span>
                </div>
                <div style={{ margin: '0 10px 20px' }}>
                    <Button type='primary' onClick={() => {
                        this.resultData = {};
                        this.props.form.resetFields();
                        this.id = undefined;
                    }}>添加银行卡</Button>
                    <br />
                    <br />
                    <BaseForm layout='inline'
                        formItemLayout={{}}
                        form={this.props.form}
                        item={toJS(item)}
                        onSubmit={this.handleSubmit} />
                </div>
                <Table columns={toJS(this.columns)}
                    loading={this.loading}
                    pagination={{
                        current: this.page,
                        total: (_.get(toJS(this.bankListQuery), 'total') as number || 0),
                        defaultPageSize: this.size,
                        onChange: (page, pageSize) => {
                            this.page = page;
                            this.size = pageSize;
                        },
                    }}
                    dataSource={dataSource} />
            </Spin>
        );
    }

    private handleSubmit = (ev: any) => {
        ev.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.loading = true;
                let url: string = '/api/crm/payment/brank';
                const json: any = _.assign({}, values, {
                    company_id: this.props.match.params.id,
                });

                if (this.id) {
                    url = `/api/crm/payment/brank/${this.props.match.params.id}`;
                }

                mutate<{}, any>({
                    url,
                    method: this.id ? 'put' : 'post',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.info('操作成功', 0.5, () => {
                            this.bankListQuery.refresh();
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

    private del = (id: number) => {
        mutate<{}, any>({
            url: `/api/crm/payment/brank/${id}`,
            method: 'delete',
        }).then(r => {
            this.loading = false;
            if (r.status_code === 200) {
                message.info('操作成功', 0.5, () => {
                    this.bankListQuery.refresh();
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

    private subBtn = (): JSX.Element => {
        return (
            <FormItem>
                <Button type='primary' htmlType='submit'>确定</Button>
                <Button
                    style={{ margin: '0 0 0 10px' }}
                    onClick={() => { this.props.history.push(`/operatePlat/company`); }}>取消</Button>
            </FormItem>
        );
    }

}

const formCreate = Form.create()(withRouter(withAppState(BankView)));

export const Bank = formCreate;
