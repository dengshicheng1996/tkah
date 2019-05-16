import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Tag } from 'common/antd/tag';
import { mutate, Querier } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import Title from '../../../../common/TitleComponent';

@observer
class RoleView extends React.Component<{ form?: WrappedFormUtils }, {}> {
    private tableRef: TableList;
    private query: Querier<any, any> = new Querier(null);
    private menusQuery: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private visible: boolean = false;
    @observable private editId: number;
    @observable private loading: boolean = false;
    @observable private resultData: any;
    @observable private menusData: any;

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getList();
        this.getMenus();
    }

    getMenus() {
        this.menusQuery.setReq({
            url: `/api/admin/menus`,
            method: 'get',
            variables: this.props.form.getFieldsValue,
        });

        this.disposers.push(autorun(() => {
            this.loading = this.menusQuery.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.menusQuery.result, 'result.data') as any) || [];
        }, searchData => {
            this.menusData = searchData;
        }));
    }

    getList = () => {
        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    getFormItem = (): BaseFormItem[] => {
        const formItem: BaseFormItem[] = [
            { key: 'role_name', type: 'input', itemProps: { label: '角色名称' } },
            {
                key: 'data_id', type: 'select', itemProps: { label: '数据权限' }, options: [
                    {
                        label: '全部数据',
                        value: 0,
                    },
                    {
                        label: '负责客户数据',
                        value: 1,
                    },
                ],
            },
            {
                key: 'menu_ids', type: 'tree', itemProps: { label: '菜单' }, options: [
                    {
                        label: '全部数据',
                        value: 0,
                    },
                    {
                        label: '负责客户数据',
                        value: 1,
                    },
                ],
            },
        ];

        return formItem;
    }

    render() {
        const columns = [
            { title: '角色名称', dataIndex: 'role_name' },
            {
                title: '状态',
                width: '15%',
                dataIndex: 'status_text',
                render: (text: any, record: any) => {
                    return (
                        <Tag color={record.status === 1 ? 'blue' : 'red'}>{text}</Tag>
                    );
                },
            },
            { title: '创建时间', dataIndex: 'created_at' },
            {
                title: '操作', dataIndex: 'status', render(status: number, record: any) {
                    return (<div>
                        <a style={{ marginRight: '10px', color: status === 1 ? 'red' : 'blue' }} onClick={() => this.banSave(record)}>
                            {+status === 1 ? '禁用' : '启用'}
                        </a>
                        <a onClick={() => this.edit(record.id)}>编辑</a>
                    </div>);
                },
            },
        ];

        return (
            <Title>
                <SearchTable
                    wrappedComponentRef={(ref: TableList) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/account/roles'
                    tableProps={{ columns }}
                    otherComponent={<Button type='primary' onClick={() => this.add()}>新建账号</Button>} />
                <Modal
                    visible={this.visible}
                    title={this.editId !== undefined ? '编辑角色' : '新增角色'}
                    onOk={() => this.submit()}
                    onCancel={() => { this.visible = false; this.props.form.resetFields(); }}
                >
                    <BaseForm form={this.props.form} item={this.getFormItem()} />
                </Modal>
            </Title>
        );
    }

    private banSave = (data: any) => {
        const json = {
            status: +data.status === 1 ? 2 : 1,
        };
        mutate<{}, any>({
            url: `/api/admin/account/roles/${data.id}`,
            method: 'put',
            variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                message.success('操作成功');
                this.tableRef.getQuery().refresh();
            } else {
                message.error(r.message);
            }
        });
    }

    private edit(id: number) {
        this.query.setReq({
            url: `/api/admin/account/roles/${id}`,
            method: 'get',
            variables: this.props.form.getFieldsValue,
        });

        this.editId = id;
        this.visible = true;
    }

    private add() {
        this.editId = undefined;
        this.visible = true;
        this.resultData = undefined;
        this.props.form.resetFields();
    }

    private submit() {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.loading = true;
                const json: any = _.assign({}, values);
                let url: string = '/api/admin/account/roles';

                if (this.editId) {
                    url = `/api/admin/account/roles/${this.editId}/edit`;
                }

                mutate<{}, any>({
                    url,
                    method: this.editId ? 'put' : 'post',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.info('操作成功', 0.5, () => {
                            this.tableRef.getQuery().refresh();
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
}
export const Role = Form.create()(RoleView);
