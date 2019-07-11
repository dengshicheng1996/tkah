import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Popconfirm } from 'common/antd/popconfirm';
import { Spin } from 'common/antd/spin';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { withRouter } from 'react-router-dom';

interface ComponentPropsType {
    form?: any;
    visible: boolean;
    editId?: number|string;
    onCancel: () => void;
    history: any;
    onOk: (values: any, r: any) => void;
}
@observer
class Component extends React.Component<ComponentPropsType, any> {
    private tableRef: TableList;
    @observable private loading: boolean = false;
    @observable private risk_model: any[] = [];
    @observable private formItem: any[] = [
        { key: 'capitalists_type',
            type: 'select', required: true,
            itemProps: { label: '签章类型' },
            typeComponentProps: { onChange: (type: any) => this.typeChange(type) },
            initialValue: 1,
            options: [{ value: 2, label: '公司签章' }, { value: 1, label: '个人签章' }] },
        { key: 'name', type: 'input', required: true, itemProps: { label: '姓名' }, options: this.risk_model },
        { key: 'legal_person_id_number', required: true, type: 'input', itemProps: { label: '身份证号' } },
        { key: 'legal_person_phone', required: true, type: 'input', itemProps: { label: '手机号' }, options: this.risk_model },
    ];
    constructor(props: any) {
        super(props);
    }
    typeChange(data: any) {
        console.log(data);
        if (!data) {
            this.formItem = [
                { key: 'capitalists_type', type: 'select', label: '签章类型', typeComponentProps: { onChange: (type: any) => this.typeChange(type) }, options: [{ value: 2, label: '公司签章' }, { value: 1, label: '个人签章' }] },
            ];
        }
        if (+data === 1) {
            this.formItem = [
                { key: 'capitalists_type', type: 'select', required: true,
                    itemProps: {label: '签章类型'},
                    typeComponentProps: { onChange: (type: any) => this.typeChange(type) },
                    options: [{ value: 2, label: '公司签章' }, { value: 1, label: '个人签章' }] },
                { key: 'name', type: 'input', itemProps: { label: '姓名' }, options: this.risk_model, required: true },
                { key: 'legal_person_id_number', itemProps: { label: '身份证号' }, type: 'input', required: true },
                { key: 'legal_person_phone', itemProps: { label: '手机号' }, type: 'input', required: true },
            ];
        } else {
            this.formItem = [
                { key: 'capitalists_type',
                    type: 'select',
                    itemProps: { label: '签章类型' },
                    typeComponentProps: { onChange: (type: any) => this.typeChange(type) },
                    options: [{ value: 2, label: '公司签章' }, { value: 1, label: '个人签章' }], required: true },
                { key: 'name', type: 'input', itemProps: { label: '公司名称' }, required: true },
                { key: 'unified_social_credit_code', type: 'input', itemProps: { label: '统一社会信用代码' }, required: true },
                { key: 'legal_person_name', type: 'input', itemProps: { label: '联系人姓名' }, required: true },
                { key: 'legal_person_id_number', type: 'input', itemProps: { label: '联系人身份证号' }, required: true },
                { key: 'legal_person_phone', type: 'input', itemProps: { label: '联系人手机号' },
                    fieldDecoratorOptions: {
                        rules: [{pattern: /^1[0-9]{10}$/, message: '手机号填写有误'}, {required: true, message: '请输入手机号'}],
                    },
                },
            ];
        }
    }
    submit(url?: string) {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                mutate<{}, any>({
                    url: '/api/admin/basicconfig/capitalists',
                    method: 'post',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.success('操作成功');
                        this.props.onOk(json, r);
                        this.props.form.resetFields();
                        url && this.props.history.push(url);
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
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 10 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 12 },
            },
        };
        return (
            <div>
                <Modal
                    visible={this.props.visible}
                    title={this.props.editId ? '编辑签章' : '新增签章'}
                    width={1200}
                    footer={
                        <div>
                            <Button onClick={() => { this.props.onCancel(); this.props.form.resetFields(); }}>取消</Button>
                            <Popconfirm
                                title={'请选择:'}
                                cancelText={'返回签章列表'}
                                okText={'配置合同'}
                                onCancel={() => this.submit()}
                                onConfirm={() => this.submit('/management/basic/init/contract')}
                                >
                                <Button type={'primary'}>保存</Button>
                            </Popconfirm>
                        </div>}
                    onCancel={() => { this.props.onCancel(); this.props.form.resetFields(); }}
                >
                    <Spin spinning={this.loading}>
                        <BaseForm col={3} formItemLayout={formItemLayout} form={this.props.form} item={this.formItem} />
                    </Spin>
                </Modal>
            </div>
        );
    }

}
const ExportViewCom: any = Form.create()(Component);
export default withRouter(ExportViewCom);
