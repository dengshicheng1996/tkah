import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { Upload } from 'common/antd/upload';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import Title from '../../../../common/TitleComponent';
interface ChnnelPropsType {
    form: WrappedFormUtils;
}
@observer
class Channel extends React.Component<ChnnelPropsType, any> {
    private tableRef: TableList;

    @observable private editId: any = '';
    @observable private visible: boolean = false;
    @observable private loading: boolean = false;
    @observable private risk_model: any[] = [{ label: 'test', value: 2 }];
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        // mutate<{}, any>({
        //     url: '/api/admin/account/allroles',
        //     method: 'get',
        //     // variables: json,
        // }).then(r => {
        //     if (r.status_code === 200) {
        //         this.risk_model = r.data;
        //     }
        // });
    }
    add() {
        this.editId = '';
        this.visible = true;
    }
    edit(data: any) {
        this.editId = data.id;
        this.visible = true;
    }
    banSave(data: any) {
        const json = {
            status: +data.status === 1 ? 2 : 1,
        };
        mutate<{}, any>({
            url: '/api/admin/basicconfig/channels/' + data.id,
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
    refreshPassword(data: any) {
        const json = {
            status: +data.status === 1 ? 2 : 1,
        };
        mutate<{}, any>({
            url: '/api/admin/basicconfig/channels/' + data.id,
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
    submit() {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                if (this.editId !== '') {
                    json['id'] = this.editId;
                }
                mutate<{}, any>({
                    url: '/api/admin/account/users',
                    method: 'post',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.success('操作成功');
                        this.visible = false;
                        this.tableRef.getQuery().refresh();
                        this.props.form.resetFields();
                    } else {
                        message.error(r.message);
                    }
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
    render() {
        const that = this;
        const columns = [
            { title: '渠道名称', dataIndex: 'name' },
            {
                title: '推广地址', dataIndex: 'invite_url', width: '300px', render(data: string) {
                    return <div style={{ width: 300, wordWrap: 'break-word' }}>{data}</div>;
                },
            },
            { title: '查看数据地址', dataIndex: 'see_data_url' },
            { title: '查看数据密码', dataIndex: 'see_data_password' },
            { title: '审批流', dataIndex: 'risk_model' },
            {
                title: '状态', dataIndex: 'status', render(data: number | string) {
                    return +data === 1 ? '启用' : '禁用';
                },
            },
            {
                title: '操作', render(data: any) {
                    return (<div>
                        <a style={{ marginRight: '10px' }}
                            onClick={() => that.banSave(data)}>{+data.status === 1 ? '禁用' : '启用'}</a>
                        <a style={{ marginRight: '10px' }} onClick={() => that.edit(data)}>编辑</a>
                        <a onClick={() => that.refreshPassword(data)}>刷新密码</a>
                    </div>);
                },
            },
        ];
        const search: BaseFormItem[] = [
            { itemProps: { label: '渠道名称' }, key: 'name', type: 'string' },
            {
                itemProps: { label: '状态' }, key: 'status', type: 'select', options: [
                    { label: '全部', value: '-1' },
                    { label: '启用', value: '1' },
                    { label: '禁用', value: '2' },
                ],
            },
        ];
        const formItem: BaseFormItem[] = [
            { key: 'name', type: 'input', itemProps: { label: '渠道名称' } },
            { key: 'bg_pic', type: 'input', itemProps: { label: '背景图', hasFeedback: false }, component: <Upload><Button>点击上传</Button></Upload> },
            { key: 'scrol_text', type: 'input', itemProps: { label: '滚动信息' }, component: <Input.TextArea /> },
            { key: 'risk_model', type: 'select', itemProps: { label: '风控审批流' }, options: this.risk_model },
        ];
        return (
            <Title>
                <Modal
                    visible={this.visible}
                    title={this.editId ? '编辑渠道' : '新增渠道'}
                    onOk={() => this.submit()}
                    onCancel={() => { this.visible = false; this.props.form.resetFields(); }}
                >
                    <Spin spinning={this.loading}>
                        <BaseForm form={this.props.form} item={formItem} />
                    </Spin>
                </Modal>
                <SearchTable
                    wrappedComponentRef={(ref) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/basicconfig/channels'
                    tableProps={{ columns }}
                    query={{ search }}
                    otherComponent={<Button type='primary' onClick={() => that.add()}>新建渠道</Button>} />
            </Title>
        );
    }

}
const ExportViewCom = Form.create()(Channel);
export default ExportViewCom;
