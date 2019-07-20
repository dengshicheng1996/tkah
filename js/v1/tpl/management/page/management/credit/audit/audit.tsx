import { Form } from 'common/antd/form';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import {Querier} from 'common/component/restFull';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
interface AuditPropsType {
    visible: boolean;
    onCancel?: () => void;
    id?: string | number;
    onOk?: (values: any) => any;
    form?: any;
}
@observer
class AuditComponent extends React.Component<AuditPropsType, any> {
    @observable private loading: boolean = false;
    @observable private apply_status: number;
    @observable private black_status: any = '';
    @observable private products: any = { auditRules: {}};
    @observable private auditResult: number|string = 0;

    constructor(props: any) {
        super(props);
    }
    onOk() {
        if (this.loading) {
            return;
        }
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                if (json.expired_at) {
                    json.expired_at = json.expired_at.format('YYYY-MM-DD');
                }
                if (this.props.onOk) {
                    this.loading = true;
                    this.props.onOk(json).then(() => {
                        this.loading = false;
                    });
                }
            }
        });
    }
    cancel() {
        this.props.form.resetFields();
        this.props.form.setFieldsValue({ black_status: '1' });
        this.black_status = '1';
        this.props.onCancel();
    }
    render() {
        let formItem: Array<TypeFormItem | ComponentFormItem> = [];
        if (this.apply_status === 2) {
            formItem = [
                {
                    itemProps: { label: '审核结果' },
                    required: true,
                    typeComponentProps: { onChange: (data: any) => { this.apply_status = data; } },
                    initialValue: this.apply_status,
                    key: 'apply_status',
                    type: 'select',
                    options: [
                        { label: '通过', value: 2 },
                        { label: '拒绝', value: 3 },
                    ],
                },
                { itemProps: { label: '授信金额' }, required: true, key: 'amount', type: 'input' },
                { itemProps: { label: '有效期' }, required: true, key: 'expired_at', type: 'datePicker' },
            ];
        } else {
            formItem = [
                {
                    itemProps: { label: '审核结果' },
                    required: true,
                    typeComponentProps: { onChange: (data: any) => { this.apply_status = data; } },
                    initialValue: this.apply_status,
                    key: 'apply_status',
                    type: 'select',
                    options: [
                        { label: '通过', value: '1' },
                        { label: '拒绝', value: '2' },
                    ],
                },
                {
                    itemProps: { label: '是否拉黑' },
                    required: true,
                    typeComponentProps: { onChange: (data: any) => { this.black_status = data; } },
                    initialValue: this.products.auditRules.is_black === 1 ? '2' : '1',
                    key: 'black_status',
                    type: 'select',
                    options: [
                        { label: '拉黑', value: 2 },
                        { label: '不拉黑', value: 1 }],
                },
                { itemProps: { label: '拒绝有效期' }, required: true, key: 'black_expired_at', type: 'datePicker' },
            ];
            if (this.black_status === '2') {
                formItem.splice(2, 1);
            }
        }
        return (<Modal
            title={'更改授信'}
            visible={this.props.visible}
            onOk={() => this.onOk()}
            onCancel={() => this.cancel()}
        >
            <Spin spinning={this.loading}>
                <BaseForm item={formItem} form={this.props.form} />
            </Spin>
        </Modal>);
    }
}
const Audit: any = Form.create()(AuditComponent);
export default Audit;
