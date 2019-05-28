import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { DatePicker } from 'common/antd/date-picker';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import {Popconfirm} from 'common/antd/popconfirm';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import { Spin } from 'common/antd/spin';
import { Table } from 'common/antd/table';
import {mutate} from 'common/component/restFull';
import { SearchTable } from 'common/component/searchTable';
import {BaseForm, BaseFormItem} from 'common/formTpl/baseForm';
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
interface RemarkPropsType {
    remarkVisible: boolean;
    remarkCancel: () => void;
    onOk: () => void;
    id: string|number;
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
        this.props.form.setFieldsValue({content: ''});
        this.props.remarkCancel();
    }
    render() {
        const formItem: BaseFormItem[] = [
            { itemProps: { label: '备注内容' } , initialValue: '', key: 'content', type: 'textArea' },
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
export default class Detail extends React.Component<{}, any> {
    @observable private id: string|number = '';
    @observable private loading: boolean = false;
    @observable private phoneVisible: boolean = false;
    @observable private rmkVisible: boolean = false;
    @observable private phoneValue: string = '';
    @observable private detail: any = {};
    constructor(props: any) {
        super(props);
        this.id = props.match.params.id;
    }
    componentDidMount() {
        this.getDetail();
    }
    async getDetail() {
        const res: any = await mutate<{}, any>({
            url: '/api/admin/customer/show/' + this.id,
            method: 'get',
        });
        this.loading = false;
        if (res.status_code === 200) {
            this.detail = res.data;
        } else {
            message.error(res.message);
        }
    }
    async editPhone() {
        // const res: any = await mutate<{}, any>({
        //     url: '/api/admin/apply/lists/' + this.id,
        //     method: 'get',
        // });
        // this.loading = false;
        // if (res.status_code === 200) {
        //     this.detail = res.data;
        // } else {
        //     message.error(res.message);
        // }
    }
    async toblack() {
        // const res: any = await mutate<{}, any>({
        //     url: '/api/admin/apply/lists/' + this.id,
        //     method: 'get',
        // });
        // this.loading = false;
        // if (res.status_code === 200) {
        //     this.detail = res.data;
        // } else {
        //     message.error(res.message);
        // }
    }
    render() {
        const remarkColumn = [
            {title: '备注更新时间', key: 'created_at', dataIndex: 'created_at'},
            {title: '最后更新人', key: 'account_name', dataIndex: 'account_name'},
            {title: '备注内容', key: 'content', dataIndex: 'content'},
        ];
        const bankCardColumn = [
            {title: '银行卡号', key: 'bank_num', dataIndex: 'bank_num'},
            {title: '银行', key: 'bank_name', dataIndex: 'bank_name'},
            {title: '预留手机号', key: 'phone', dataIndex: 'phone'},
            {title: '绑定通道', key: 'pay_type_text', dataIndex: 'pay_type_text'},
        ];
        const handleColumn = [
            {title: '时间', key: 'rule_name', dataIndex: 'rule_name'},
            {title: '操作人', key: 'rule_standard', dataIndex: 'rule_standard'},
            {title: '内容', key: 'risk_result', dataIndex: 'risk_result'},
        ];
        const history = <div>
            <Row style={{marginBottom: 24}}>
                <Col span={4}>申请次数：{this.detail.apply_num}</Col>
                <Col span={4}>通过次数：{this.detail.pass_num}</Col>
                <Col span={4}>拒绝次数：{this.detail.reject_num}</Col>
                <Col span={4}>借款次数：{this.detail.loan_num}</Col>
                <Col span={4}>逾期次数：{this.detail.overdue_num}</Col>
                <Col span={4}>展期次数：{this.detail.extension_num}</Col>
            </Row>
        </div>;
        const info = <div></div>;
        const bankCard = <div>
            <Table columns={bankCardColumn} dataSource={this.detail.bankList || []} pagination={false}/>
        </div>;
        const register = <div>
            <Row style={{marginBottom: 24}}>
                <Col span={6}>手机号：{this.detail.customer_extra ? this.detail.customer_extra.apply_num : ''}</Col>
                <Col span={6}>创建时间：{this.detail.customer_extra ? this.detail.customer_extra.pass_num : ''}</Col>
                <Col span={6}>来源渠道：{this.detail.customer_extra ? this.detail.customer_extra.reject_num : ''}</Col>
            </Row>
            <Row style={{marginBottom: 24}}>
                <Col span={6}>注册状态：{this.detail.customer_extra ? this.detail.customer_extra.apply_num : ''}</Col>
                <Col span={6}>注册时间：{this.detail.customer_extra ? this.detail.customer_extra.pass_num : ''}</Col>
                <Col span={6}>注册渠道：{this.detail.customer_extra ? this.detail.customer_extra.reject_num : ''}</Col>
                <Col span={6}>最新渠道：{this.detail.customer_extra ? this.detail.customer_extra.loan_num : ''}</Col>
            </Row>
        </div>;
        const contract = <div></div>;
        const handle = <div>
            <Table columns={handleColumn} dataSource={this.detail.credit_remark || []} pagination={false}/>
        </div>;
        const remark = <div>
            <Table columns={remarkColumn} dataSource={this.detail.remarkList || []} pagination={false}/>
        </div>;
        const component = [
            <div style={{ height: '110px'}}>
                <div style={{ width: '600px', float: 'left'}}>
                    <div style={{fontSize: '24px', marginBottom: '15px'}}>
                        {
                            this.detail.customer
                                ?
                                <span>{this.detail.customer.phone}<span style={{margin: '0 10px'}}>|</span>{this.detail.customer.name}</span>
                                :
                                ''
                        }
                        <span style={{fontSize: '14px', marginLeft: '60px'}}>{this.detail.review_status_text}</span>
                    </div>
                    <Row style={{ marginBottom: '15px'}}>
                        <Col span={8}>申请编号：{this.detail.id}</Col>
                        <Col span={8}>关联渠道：{this.detail.channel ? this.detail.channel.name : ''}</Col>
                        <Col span={8}>负责人：{this.detail.assign_name}</Col>
                    </Row>
                    <Row style={{ marginBottom: '15px'}}>
                        <Col span={8}>审核结果：{this.detail.review_status_text}</Col>
                        <Col span={8}>额度：{this.detail.credit ? this.detail.credit.credit_amount : ''}</Col>
                        <Col span={8}>有效期：{this.detail.credit ? this.detail.credit.expired_at_text : ''}</Col>
                    </Row>
                </div>
                <div style={{ width: '300px', float: 'right'}}>
                    <Button style={{ marginRight: 20}} type='primary' onClick={() => this.phoneVisible = true}>更改手机号</Button>
                    <Popconfirm onConfirm={() => this.toblack()} title='你确定要拉黑这个客户吗？' okText='确定' cancelText='取消'>
                        <Button style={{ marginRight: 20}} type='primary'>拉黑</Button>
                    </Popconfirm>
                    <Button type='primary' onClick={() => this.rmkVisible = true}>客户备注</Button>
                </div>
            </div>,
            <CardClass title='历史统计' content={history} />,
            <CardClass title='客户备注' content={remark} />,
            <CardClass title='资料信息' content={info} />,
            <CardClass title='银行卡' content={bankCard} />,
            <CardClass title='注册信息' content={register} />,
            <CardClass title='授权合同' content={contract} />,
            <CardClass title='操作记录' content={handle} />,
            <div>
                <Modal
                    title={'更改手机号'}
                    visible={this.phoneVisible}
                    onOk={() => this.editPhone()}
                    onCancel={() => this.phoneVisible = false}
                >
                    <Spin spinning={this.loading}>
                        <Row>
                            <Col style={{lineHeight: '31px', textAlign: 'right'}} span={6}>更改后的手机号：</Col>
                            <Col span={16}><Input value={this.phoneValue} onChange={(e: any) => this.phoneValue = e.target.value} /></Col>
                        </Row>
                    </Spin>
                </Modal>
                <Remark onOk={() => this.getDetail()} credit={this.detail.credit} id={this.id} remarkCancel={() => {this.rmkVisible = false; }} remarkVisible={this.rmkVisible} />
            </div>,
        ];
        return (
                <Title component={component}/>
        );
    }
}
