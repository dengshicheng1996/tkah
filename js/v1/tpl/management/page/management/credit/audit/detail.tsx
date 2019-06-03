import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { DatePicker } from 'common/antd/date-picker';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import { Spin } from 'common/antd/spin';
import { Table } from 'common/antd/table';
import { mutate } from 'common/component/restFull';
import { SearchTable } from 'common/component/searchTable';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment';
import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import CardClass from '../../../../common/CardClass';
import Title from '../../../../common/TitleComponent';
interface PassPropsType {
    passVisible: boolean;
    passCancel: () => void;
    id: string | number;
    onOk: () => void;
    form?: any;
    credit: any;
}
@observer
class PassComponent extends React.Component<PassPropsType, any> {
    @observable private loading: boolean = false;
    constructor(props: any) {
        super(props);
    }
    reject() {
        const that = this;
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                json.expired_at = json.expired_at.format('YYYY-MM-DD');
                this.loading = true;
                const res: any = await mutate<{}, any>({
                    url: '/api/admin/apply/passed/' + this.props.id,
                    method: 'put',
                    variables: json,
                }).catch((error: any) => {
                    Modal.error({
                        title: '警告',
                        content: `Error: ${JSON.stringify(error)}`,
                    });
                    return {};
                });
                that.loading = false;
                if (res.status_code === 200) {
                    message.success('操作成功');
                    this.cancel();
                    this.props.onOk();
                }
            }
        });
    }
    cancel() {
        this.props.form.setFieldsValue({
            amount: this.props.credit ? this.props.credit.credit_amount : '',
            expired_at: moment(this.props.credit ? this.props.credit.expired_at_text : ''),
        });
        this.props.passCancel();
    }
    render() {
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '额度' }, initialValue: this.props.credit ? this.props.credit.credit_amount : '', key: 'amount', type: 'input' },
            { itemProps: { label: '额度有效期' }, initialValue: this.props.credit ? moment(this.props.credit.expired_at_text) : moment(), key: 'expired_at', type: 'datePicker' },
        ];
        return (<Modal
            title={'审核通过'}
            visible={this.props.passVisible}
            onOk={() => this.reject()}
            onCancel={() => this.cancel()}
        >
            <Spin spinning={this.loading}>
                <BaseForm item={formItem} form={this.props.form} />
            </Spin>
        </Modal>);
    }
}
const Pass: any = Form.create()(PassComponent);
interface RejectPropsType {
    rejectVisible: boolean;
    rejectCancel: () => void;
    id: string | number;
    onOk: () => void;
    form?: any;
}
@observer
class RejectComponent extends React.Component<RejectPropsType, any> {
    @observable private loading: boolean = false;
    constructor(props: any) {
        super(props);
    }
    pass() {
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                json.black_expired_at = json.black_expired_at.format('YYYY-MM-DD');
                this.loading = true;
                const res: any = await mutate<{}, any>({
                    url: '/api/admin/apply/reject/' + this.props.id,
                    method: 'put',
                    variables: json,
                }).catch((error: any) => {
                    Modal.error({
                        title: '警告',
                        content: `Error: ${JSON.stringify(error)}`,
                    });
                    return {};
                });
                this.loading = false;
                if (res.status_code === 200) {
                    message.success('操作成功');
                    this.cancel();
                    this.props.onOk();
                }
            }
        });
    }
    cancel() {
        this.props.form.setFieldsValue({ black_status: '1', black_expired_at: moment() });
        this.props.rejectCancel();
    }
    render() {
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '是否拉黑' }, initialValue: '1', key: 'black_status', type: 'select', options: [{ label: '拉黑', value: '1' }, { label: '不拉黑', value: '2' }] },
            { itemProps: { label: '拒绝有效期' }, initialValue: moment(), key: 'black_expired_at', type: 'datePicker' },
        ];
        return (<Modal
            title={'审核通过'}
            visible={this.props.rejectVisible}
            onOk={() => this.pass()}
            onCancel={() => this.cancel()}
        >
            <Spin spinning={this.loading}>
                <BaseForm item={formItem} form={this.props.form} />
            </Spin>
        </Modal>);
    }
}
const Reject: any = Form.create()(RejectComponent);
interface RemarkPropsType {
    remarkVisible: boolean;
    remarkCancel: () => void;
    onOk: () => void;
    id: string | number;
    form?: any;
}
@observer
class RemarkComponent extends React.Component<RemarkPropsType, any> {
    @observable private loading: boolean = false;
    constructor(props: any) {
        super(props);
    }
    remark() {
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                this.loading = true;
                const res: any = await mutate<{}, any>({
                    url: '/api/admin/apply/remark/' + this.props.id,
                    method: 'post',
                    variables: json,
                }).catch((error: any) => {
                    Modal.error({
                        title: '警告',
                        content: `Error: ${JSON.stringify(error)}`,
                    });
                    return {};
                });
                this.loading = false;
                if (res.status_code === 200) {
                    message.success('操作成功');
                    this.cancel();
                    this.props.onOk();
                }
            }
        });
    }
    cancel() {
        this.props.form.setFieldsValue({ content: '' });
        this.props.remarkCancel();
    }
    render() {
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '备注内容' }, initialValue: '', key: 'content', type: 'textArea' },
        ];
        return (<Modal
            title={'备注'}
            visible={this.props.remarkVisible}
            onOk={() => this.remark()}
            onCancel={() => this.cancel()}
        >
            <Spin spinning={this.loading}>
                <BaseForm item={formItem} form={this.props.form} />
            </Spin>
        </Modal>);
    }
}
const Remark: any = Form.create()(RemarkComponent);
@observer
export default class Audit extends React.Component<{}, any> {
    @observable private auditVisible: boolean = false;
    @observable private id: string | number = '';
    @observable private loading: boolean = false;
    @observable private passVisible: boolean = false;
    @observable private rejectVisible: boolean = false;
    @observable private rmkVisible: boolean = false;
    @observable private detail: any = {};
    @observable private black: number = 1;
    constructor(props: any) {
        super(props);
        this.id = props.match.params.id;
    }
    componentDidMount() {
        this.getDetail();
    }
    async getDetail() {
        const res: any = await mutate<{}, any>({
            url: '/api/admin/apply/lists/' + this.id,
            method: 'get',
        });
        this.loading = false;
        if (res.status_code === 200) {
            this.detail = res.data;
        } else {
            message.error(res.message);
        }
    }
    render() {
        const remarkColumn = [
            { title: '备注时间', key: 'created_at', dataIndex: 'created_at' },
            { title: '操作人', key: 'account_name', dataIndex: 'account_name' },
            { title: '备注内容', key: 'content', dataIndex: 'content' },
        ];
        const creditColumn = [
            { title: '时间', key: 'created_at', dataIndex: 'created_at' },
            { title: '操作人', key: 'account_name', dataIndex: 'account_name' },
            { title: '内容', key: 'content', dataIndex: 'content' },
        ];
        const historyColumn = [
            { title: '申请日期', key: 'apply_at_text', dataIndex: 'apply_at_text' },
            { title: '审核结果', key: 'apply_status_text', dataIndex: 'apply_status_text' },
            { title: '提现状态', key: 'withdraw_status_text', dataIndex: 'withdraw_status_text' },
            { title: '借款日期', key: 'loan_at_text', dataIndex: 'loan_at_text' },
            { title: '逾期次数', key: 'overdue_num', dataIndex: 'overdue_num' },
            { title: '展期次数', key: 'extension_num', dataIndex: 'extension_num' },
            { title: '结清日期', key: 'clearing_time_text', dataIndex: 'clearing_time_text' },
        ];
        const resultColumn = [
            { title: '命中规则', key: 'rule_name', dataIndex: 'rule_name' },
            { title: '规则标准', key: 'rule_standard', dataIndex: 'rule_standard' },
            { title: '借款人数据', key: 'risk_result', dataIndex: 'risk_result' },
        ];
        const result = <div>
            <Row style={{ fontSize: 22, marginBottom: 24 }}>
                <Col span={6}>机审结果：{this.detail.risk_report ? this.detail.risk_report.review_status_text : ''}</Col>
                <Col span={6}>风控建议：{this.detail.risk_report ? this.detail.risk_report.recommend : ''}</Col>
                <Col span={6}>风险评级：{this.detail.risk_report ? this.detail.risk_report.rating : ''}</Col>
                <Col span={6}>评分：{this.detail.risk_report ? this.detail.risk_report.score : ''}</Col>
            </Row>
            <Table columns={resultColumn} dataSource={this.detail.risk_rule || []} pagination={false} />
        </div>;
        const history = <div>
            <Row style={{ marginBottom: 24 }}>
                <Col span={4}>申请次数：{this.detail.customer_extra ? this.detail.customer_extra.apply_num : ''}</Col>
                <Col span={4}>通过次数：{this.detail.customer_extra ? this.detail.customer_extra.pass_num : ''}</Col>
                <Col span={4}>拒绝次数：{this.detail.customer_extra ? this.detail.customer_extra.reject_num : ''}</Col>
                <Col span={4}>借款次数：{this.detail.customer_extra ? this.detail.customer_extra.loan_num : ''}</Col>
                <Col span={4}>逾期次数：{this.detail.customer_extra ? this.detail.customer_extra.overdue_num : ''}</Col>
                <Col span={4}>展期次数：{this.detail.customer_extra ? this.detail.customer_extra.extension_num : ''}</Col>
            </Row>
            <Table columns={historyColumn} dataSource={this.detail.apply_history || []} pagination={false} />
        </div>;
        const info = <div></div>;
        const credit = <div>
            <Table columns={creditColumn} dataSource={this.detail.credit_record || []} pagination={false} />
        </div>;
        const remark = <div>
            <Table columns={remarkColumn} dataSource={this.detail.credit_remark || []} pagination={false} />
        </div>;
        const component = [
            <div style={{ height: '110px' }}>
                <div style={{ width: '600px', float: 'left' }}>
                    <div style={{ fontSize: '24px', marginBottom: '15px' }}>
                        {
                            this.detail.customer
                                ?
                                <span>{this.detail.customer.phone}<span style={{ margin: '0 10px' }}>|</span>{this.detail.customer.name}</span>
                                :
                                ''
                        }
                        <span style={{ fontSize: '14px', marginLeft: '60px' }}>{this.detail.review_status_text}</span>
                    </div>
                    <Row style={{ marginBottom: '15px' }}>
                        <Col span={8}>申请编号：{this.detail.id}</Col>
                        <Col span={8}>关联渠道：{this.detail.channel ? this.detail.channel.name : ''}</Col>
                        <Col span={8}>负责人：{this.detail.assign_name}</Col>
                    </Row>
                    <Row style={{ marginBottom: '15px' }}>
                        <Col span={8}>审核结果：{this.detail.review_status_text}</Col>
                        <Col span={8}>额度：{this.detail.credit ? this.detail.credit.credit_amount : ''}</Col>
                        <Col span={8}>有效期：{this.detail.credit ? this.detail.credit.expired_at_text : ''}</Col>
                    </Row>
                </div>
                <div style={{ width: '300px', float: 'right' }}>
                    <Button style={{ marginRight: 20 }} type='primary' onClick={() => this.passVisible = true}>通过</Button>
                    <Button style={{ marginRight: 20 }} type='primary' onClick={() => this.rejectVisible = true}>拒绝</Button>
                    <Button type='primary' onClick={() => this.rmkVisible = true}>客户备注</Button>
                </div>
            </div>,
            <CardClass title='机审风控结果' content={result} />,
            <CardClass title='历史统计' content={history} />,
            <CardClass title='资料信息' content={info} />,
            <CardClass title='客户备注' content={remark} />,
            <CardClass title='授信记录' content={credit} />,
            <div>
                <Pass onOk={() => this.getDetail()} credit={this.detail.credit} id={this.id} passCancel={() => { this.passVisible = false; }} passVisible={this.passVisible} />
                <Reject onOk={() => this.getDetail()} credit={this.detail.credit} id={this.id} rejectCancel={() => { this.rejectVisible = false; }} rejectVisible={this.rejectVisible} />
                <Remark onOk={() => this.getDetail()} credit={this.detail.credit} id={this.id} remarkCancel={() => { this.rmkVisible = false; }} remarkVisible={this.rmkVisible} />
            </div>,
        ];
        return (
            <Title component={component} />
        );
    }
}
