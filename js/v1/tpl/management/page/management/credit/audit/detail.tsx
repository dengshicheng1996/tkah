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
import {SearchTable, TableList} from 'common/component/searchTable';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as moment from 'moment';
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
    default_amount_date: string;
    default_amount: string;
}
@observer
class PassComponent extends React.Component<PassPropsType, any> {
    @observable private loading: boolean = false;
    constructor(props: any) {
        super(props);
    }
    reject() {
        if (this.loading) {
            return;
        }
        const that = this;
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                if (json.expired_at) {
                    json.expired_at = json.expired_at.format('YYYY-MM-DD');
                }
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
        this.props.form.resetFields();
        this.props.passCancel();
    }
    render() {
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '额度' },
                initialValue: this.props.default_amount ? this.props.default_amount : '',
                key: 'amount', type: 'input', required: true },
            { itemProps: { label: '额度有效期' },
                initialValue: this.props.default_amount_date ? moment(this.props.default_amount_date) : undefined,
                key: 'expired_at', type: 'datePicker',
                required: true,
            },
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
    @observable private black_status: any = '';
    constructor(props: any) {
        super(props);
    }
    pass() {
        if (this.loading) {
            return;
        }
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                if (json.black_expired_at) {
                    json.black_expired_at = json.black_expired_at.format('YYYY-MM-DD');
                }
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
        this.props.form.resetFields();
        this.props.form.setFieldsValue({ black_status: '1' });
        this.black_status = '1';
        this.props.rejectCancel();
    }
    render() {
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            {
                itemProps: { label: '是否拉黑' },
                required: true,
                typeComponentProps: { onChange: (data: any) => { this.black_status = data; } },
                initialValue: '1', key: 'black_status', type: 'select', options: [{ label: '拉黑', value: '2' }, { label: '不拉黑', value: '1' }],
            },
            { itemProps: { label: '拒绝有效期' }, required: true, key: 'black_expired_at', type: 'datePicker' },
        ];
        if (this.black_status === '2') {
            formItem.splice(1, 1);
        }
        return (<Modal
            title={'审过拒绝'}
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
    editRmkId?: any;
}
@observer
class RemarkComponent extends React.Component<RemarkPropsType, any> {
    @observable private loading: boolean = false;
    constructor(props: any) {
        super(props);
    }
    remark() {
        if (this.loading) {
            return;
        }
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                let url = '/api/admin/apply/remark/' + this.props.id;
                let method = 'post';
                if (this.props.editRmkId) {
                    method = 'put';
                    url = `/api/admin/apply/remark/${this.props.id}/${this.props.editRmkId}`;
                }
                this.loading = true;
                const res: any = await mutate<{}, any>({
                    url,
                    method,
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
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '备注内容' },
                formItemLayout,
                typeComponentProps: {style: { height: 180}},
                required: true,
                initialValue: '',
                key: 'content',
                type: 'textArea',
            },
        ];
        return (<Modal
            forceRender
            title={'备注'}
            width={800}
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
    @observable private editRmkId: any;
    @observable private rmkComponent: any;
    @observable private detail: any = {};
    @observable private black: number = 1;
    constructor(props: any) {
        super(props);
        this.id = props.match.params.id;
    }
    componentDidMount() {
        this.getDetail();
    }
    editRmk(data: any) {
        console.log(data.id);
        this.editRmkId = data.id;
        this.rmkComponent.props.form.setFieldsValue({ content: data.content });
        this.rmkVisible = true;
    }
    async getDetail() {
        const res: any = await mutate<{}, any>({
            url: '/api/admin/apply/lists/' + this.id,
            method: 'get',
        });
        this.loading = false;
        if (res.status_code === 200) {
            this.detail = res.data;
        }
        const res3: any = await mutate<{}, any>({
            url: '/api/admin/customer/getinfostate/' + this.detail.customer_id,
            method: 'get',
        });
        if (res3.status_code === 200) {
            this.detail.infoList = res3.data;
        }
    }
    async getAuditAutoReport() {
        const json = {
            apply_id: this.detail.id,
            flow_id: this.detail.flow_id,
        };
        const res: any = await mutate<{}, any>({
            url: '/api/admin/riskflow/anew',
            method: 'get',
            variables: json,
        });
        if (res.status_code === 200) {
            this.getDetail();
        }
    }
    render() {
        const remarkColumn = [
            { title: '备注时间', key: 'updated_at_text', dataIndex: 'updated_at_text' },
            { title: '操作人', key: 'account_name', dataIndex: 'account_name' },
            { title: '备注内容', key: 'content', dataIndex: 'content' },
            { title: '操作', key: 'set', render: (data: any) => <a onClick={() => this.editRmk(data)}>修改</a> },
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
        (this.detail.risk_rule || []).map((item: any, index: number) => {
            item.key = index;
        });
        (this.detail.apply_history || []).map((item: any, index: number) => {
            item.key = index;
        });
        (this.detail.credit_record || []).map((item: any, index: number) => {
            item.key = index;
        });
        (this.detail.customer_remark || []).map((item: any, index: number) => {
            item.key = index;
        });
        const {apply_history_statistics = {}, auditAuto = {}} = this.detail;
        const infoList = this.detail.infoList || {};
        const infoObj: any = {
            addressBook: '通讯录',
            antiFraudReport: '反欺诈',
            contact: '紧急联系人',
            face: '人脸识别',
            idcardorc: '身份证ocr验证',
            operatorReport: '运营商报告',
        };
        let result: any;
        if (auditAuto.suggest === 1) {
            result = <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '20px'}}>风控结果查询中......请耐心等待</div>
            </div>;
        } else if  (auditAuto.suggest === 5) {
            result = <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '20px'}}>风控结果获取失败，原因：<span style={{color: 'red'}}>{auditAuto.suggest_text}</span></div>
                <div style={{marginTop: '20px'}}><Button type='primary' onClick={() => this.getAuditAutoReport()}>重新获取风控报告</Button></div>
            </div>;
        } else {
            result = <div>
                <Row style={{ fontSize: 22, marginBottom: 24 }}>
                    <Col span={6}>机审结果：{auditAuto.suggest_text}</Col>
                    <Col span={6}>风控建议：{auditAuto.credit_level_text}</Col>
                    <Col span={6}>风险评级：{auditAuto.risk_rating}</Col>
                    <Col span={6}>评分：{auditAuto.score}</Col>
                </Row>
                <Table rowKey={'key'} columns={resultColumn} dataSource={this.detail.risk_rule || []} pagination={false} />
            </div>;
        }
        const history = <div>
            <Row style={{ marginBottom: 24 }}>
                <Col span={4}><Link to={'/management/credit/audit?phone=' + this.detail.phone}>申请次数：{apply_history_statistics.apply_num}</Link></Col>
                <Col span={4}>通过次数：{apply_history_statistics.pass_num}</Col>
                <Col span={4}>拒绝次数：{apply_history_statistics.reject_num}</Col>
                <Col span={4}><Link to={'/management/credit/withdraw?phone=' + this.detail.customer.phone + '&loan_status=3'}>借款次数：{apply_history_statistics.loan_num}</Link></Col>
                <Col span={4}>逾期次数：{apply_history_statistics.overdue_num}</Col>
                <Col span={4}>展期次数：{apply_history_statistics.extension_num}</Col>
            </Row>
            <Table rowKey={'key'} columns={historyColumn} dataSource={this.detail.apply_history || []} pagination={false} />
        </div>;
        const info = <div>
            {
                Object.keys(infoList).map((item: any, index: number) => {
                    return infoList[item] ? <Button type='primary' size={'large'} key={index} style={{ marginRight: 20 }}>{infoObj[item]}</Button> : '';
                })
            }
        </div>;
        const credit = <div>
            <Table rowKey={'key'} columns={creditColumn} dataSource={this.detail.credit_record || []} pagination={false} />
        </div>;
        const remark = <div>
            <Table rowKey={'key'} columns={remarkColumn} dataSource={this.detail.customer_remark || []} pagination={false} />
        </div>;
        const component = [
            <div style={{ height: '110px' }}>
                <div>
                    <Pass
                        onOk={() => this.getDetail()}
                        default_amount={this.detail.default_amount}
                        default_amount_date={this.detail.default_amount_date}
                        id={this.id}
                        passCancel={() => { this.passVisible = false; }}
                        passVisible={this.passVisible} />
                    <Reject onOk={() => this.getDetail()} credit={this.detail.credit} id={this.id} rejectCancel={() => { this.rejectVisible = false; }} rejectVisible={this.rejectVisible} />
                    <Remark
                        wrappedComponentRef={(ref: TableList) => { this.rmkComponent = ref; }}
                        onOk={() => this.getDetail()}
                        credit={this.detail.credit}
                        editRmkId={this.editRmkId}
                        id={this.id}
                        remarkCancel={() => { this.rmkVisible = false; }}
                        remarkVisible={this.rmkVisible} />
                </div>,
                <div style={{ width: '600px', float: 'left' }}>
                    <div style={{ fontSize: '24px', marginBottom: '15px' }}>
                        {
                            this.detail.customer
                                ?
                                <span>{this.detail.customer.phone}<span style={{ margin: '0 10px' }}>|</span>{this.detail.customer.name}</span>
                                :
                                ''
                        }
                        {
                            +this.detail.apply_status === 1 ?  <span style={{ fontSize: '14px', marginLeft: '60px' }}>{this.detail.audit_level_text}</span> : ''
                        }
                    </div>
                    <Row style={{ marginBottom: '15px' }}>
                        <Col span={8}>申请编号：{this.detail.id}</Col>
                        <Col span={8}>关联渠道：{this.detail.channel ? this.detail.channel.name : ''}</Col>
                        {/*<Col span={8}>负责人：{this.detail.assign_name}</Col>*/}
                    </Row>
                    <Row style={{ marginBottom: '15px' }}>
                        <Col span={8}>审核结果：{this.detail.apply_status_text}</Col>
                        {
                            this.detail.apply_status === 2
                                ?
                                <Col span={8}>额度：{this.detail.credit ? this.detail.credit.credit_amount : ''}</Col>
                                :
                                ''
                        }
                        <Col span={8}>有效期：{this.detail.expiration_date}</Col>
                    </Row>
                </div>
                <div style={{ width: '300px', float: 'right' }}>
                    {
                        this.detail.apply_status === 1 ? <Button style={{ marginRight: 20 }} type='primary' onClick={() => this.passVisible = true}>通过</Button> : ''
                    }
                    {
                        this.detail.apply_status === 1 ? <Button style={{ marginRight: 20 }} type='primary' onClick={() => this.rejectVisible = true}>拒绝</Button> : ''
                    }
                    <Button type='primary' onClick={() => {this.editRmkId = ''; this.rmkVisible = true; }}>客户备注</Button>
                </div>
            </div>,
            <CardClass title='机审风控结果' content={result} />,
            apply_history_statistics.apply_num === 0 ? null : <CardClass title='历史统计' content={history} />,
            <CardClass title='资料信息' content={info} />,
            (this.detail.customer_remark || []).length > 0 ? <CardClass title='客户备注' content={remark} /> : null,
            <CardClass title='授信记录' content={credit} />,
        ];
        return (
            <Title component={component} />
        );
    }
}
