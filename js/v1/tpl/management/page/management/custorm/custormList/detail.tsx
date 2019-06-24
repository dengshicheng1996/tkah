import { Button } from 'common/antd/button';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Popconfirm } from 'common/antd/popconfirm';
import { Row } from 'common/antd/row';
import { Spin } from 'common/antd/spin';
import { Table } from 'common/antd/table';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
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
import { Tag } from '../../../../../common/antd/tag';
import {withAppState} from '../../../../common/appStateStore';
import CardClass from '../../../../common/CardClass';
import Title from '../../../../common/TitleComponent';
interface RemarkPropsType {
    remarkVisible: boolean;
    remarkCancel: () => void;
    onOk: () => void;
    id: string | number;
    form?: any;
    editRmkId?: string;
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
                let url = '/api/admin/customer/remark';
                let method = 'post';
                if (this.props.editRmkId) {
                    method = 'put';
                    url = '/api/admin/customer/remark/' + this.props.editRmkId;
                }
                json.customerId = this.props.id;
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
        this.props.form.setFieldsValue({ remark: '' });
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
                key: 'remark',
                type: 'textArea',
            },
        ];
        return (<Modal
            forceRender
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
interface DetailPropsType {
    data: any;
    location: any;
}
@observer
class Detail extends React.Component<DetailPropsType, any> {
    @observable private id: string | number = '';
    @observable private loading: boolean = false;
    @observable private phoneLoading: boolean = false;
    @observable private toblackLoading: boolean = false;
    @observable private phoneVisible: boolean = false;
    @observable private rmkVisible: boolean = false;
    @observable private phoneValue: string = '';
    @observable private editRmkId: string = '';
    @observable private detail: any = {};
    @observable private rmkComponent: any;
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
        if (res.status_code === 200) {
            this.detail = res.data;
            const {phone, name} = res.data;
            this.props.data.appState.panes.map((item: any) => {
                if ('/management' + item.url === this.props.location.pathname) {
                    item.title =  '客户详情|' + name;
                }
            });
        }
        const res2: any = await mutate<{}, any>({
            url: '/api/admin/customer/operates/' + this.id,
            method: 'get',
        });
        if (res2.status_code === 200) {
            this.detail.operList = res2.data.list;
        }
        const res3: any = await mutate<{}, any>({
            url: '/api/admin/customer/getinfostate/' + this.id,
            method: 'get',
        });
        if (res3.status_code === 200) {
            this.detail.infoList = res3.data;
        }

    }
    async editPhone() {
        if (this.phoneLoading) {
            return;
        }
        const json = {
            customerId: this.id,
            mobile: this.phoneValue,
        };
        this.phoneLoading = true;
        const res: any = await mutate<{}, any>({
            url: '/api/admin/customer/changemobile',
            method: 'post',
            variables: json,
        }).catch((error: any) => {
            Modal.error({
                title: '警告',
                content: `Error: ${JSON.stringify(error)}`,
            });
            return {};
        });
        this.phoneLoading = false;
        if (res.status_code === 200) {
            message.success('操作成功');
            this.phoneVisible = false;
            this.getDetail();
            this.phoneValue = '';
        } else {
            message.error(res.message);
        }
    }
    async toblack() {
        if (this.toblackLoading) {
            return;
        }
        this.toblackLoading = true;
        let res: any = '';
        if (this.detail.black_status === 2) {
            res = await mutate<{}, any>({
                url: '/api/admin/customer/cancelblack/' + this.id,
                method: 'put',
            }).catch((error: any) => {
                Modal.error({
                    title: '警告',
                    content: `Error: ${JSON.stringify(error)}`,
                });
                return {};
            });
        } else {
            res = await mutate<{}, any>({
                url: '/api/admin/customer/pullblack/' + this.id,
                method: 'put',
            }).catch((error: any) => {
                Modal.error({
                    title: '警告',
                    content: `Error: ${JSON.stringify(error)}`,
                });
                return {};
            });
        }
        this.toblackLoading = false;
        if (res.status_code === 200) {
            message.success('操作成功');
            this.getDetail();
        } else {
            message.error(res.message);
        }
    }
    editRmk(data: any) {
        this.editRmkId = data.id;
        this.rmkComponent.props.form.setFieldsValue({ remark: data.content });
        this.rmkVisible = true;
    }
    render() {
        const jurisdiction: number[] = this.props.data.appState.jurisdiction || [];
        (this.detail.bankList || []).map((item: any, index: number) => {
            item.key = index;
        });
        (this.detail.credit_remark || []).map((item: any, index: number) => {
            item.key = index;
        });
        (this.detail.remarkList || []).map((item: any, index: number) => {
            item.key = index;
        });
        (this.detail.operList || []).map((item: any, index: number) => {
            item.key = index;
        });
        const infoList = this.detail.infoList || {};
        const infoObj: any = {
            addressBook: '通讯录',
            antiFraudReport: '反欺诈',
            contact: '紧急联系人',
            face: '人脸识别',
            idcardorc: '身份证ocr验证',
            operatorReport: '运营商报告',
        };
        const remarkColumn = [
            { title: '备注更新时间', key: 'updated_at_text', dataIndex: 'updated_at_text' },
            { title: '最后更新人', key: 'account_name', dataIndex: 'account_name' },
            { title: '备注内容', key: 'content', dataIndex: 'content' },
            { title: '操作', key: 'set', render: (data: any) => jurisdiction.indexOf(40)  > -1 ? <a onClick={() => this.editRmk(data)}>修改</a> : null },
        ];
        const bankCardColumn = [
            { title: '银行卡号', key: 'bank_num', dataIndex: 'bank_num' },
            { title: '银行', key: 'bank_name', dataIndex: 'bank_name' },
            { title: '预留手机号', key: 'phone', dataIndex: 'phone' },
            { title: '绑定通道', key: 'pay_type_text', dataIndex: 'pay_type_text' },
        ];
        const handleColumn = [
            { title: '时间', key: 'created_at', dataIndex: 'created_at' },
            { title: '操作人', key: 'account_name', dataIndex: 'account_name' },
            { title: '内容', key: 'remarks', dataIndex: 'remarks' },
        ];
        const history = <div>
            <Row style={{ marginBottom: 24 }}>
                <Col span={4}><Link to={'/management/credit/audit?phone=' + this.detail.phone}>申请次数：{this.detail.apply_num}</Link></Col>
                <Col span={4}>通过次数：{this.detail.pass_num}</Col>
                <Col span={4}>拒绝次数：{this.detail.reject_num}</Col>
                <Col span={4}><Link to={'/management/credit/withdraw?phone=' + this.detail.phone + '&loan_status=3'}>累计借款：{this.detail.loan_num}</Link></Col>
                <Col span={4}>逾期次数：{this.detail.overdue_num}</Col>
                <Col span={4}>展期次数：{this.detail.extension_num}</Col>
            </Row>
        </div>;
        const info = <div>
            {
                Object.keys(infoList).map((item: any, index: number) => {
                    return infoList[item] ? <Button type='primary' size={'large'} key={index} style={{ marginRight: 20 }}>{infoObj[item]}</Button> : '';
                })
            }
        </div>;
        const bankCard = <div>
            <Table rowKey={'key'} columns={bankCardColumn} dataSource={this.detail.bankList || []} pagination={false} />
        </div>;
        const register = <div>
            <Row style={{ marginBottom: 24 }}>
                <Col span={6}>手机号：{this.detail.phone}</Col>
                {/*<Col span={6}>创建时间：{this.detail.created_at}</Col>*/}
                {/*<Col span={6}>来源渠道：{this.detail.from_channel_name}</Col>*/}
            </Row>
            <Row style={{ marginBottom: 24 }}>
                <Col span={6}>注册状态：{this.detail.register_status_text}</Col>
                <Col span={6}>注册时间：{this.detail.register_at}</Col>
                <Col span={6}>注册渠道：{this.detail.reg_channel_name}</Col>
                <Col span={6}>最新渠道：{this.detail.new_channel_name}</Col>
            </Row>
        </div>;
        const contract = <div></div>;
        const handle = <div>
            <Table rowKey={'key'} columns={handleColumn} dataSource={this.detail.operList || []} pagination={false} />
        </div>;
        const remark = <div>
            <Table rowKey={'key'} columns={remarkColumn} dataSource={this.detail.remarkList || []} pagination={false} />
        </div>;
        const component = [
            <div style={{ height: '80px' }}>
                <Modal
                    title={'更改手机号'}
                    visible={this.phoneVisible}
                    onOk={() => this.editPhone()}
                    onCancel={() => this.phoneVisible = false}
                >
                    <Spin spinning={this.phoneLoading}>
                        <Row>
                            <Col style={{ lineHeight: '31px', textAlign: 'right' }} span={6}>更改后的手机号：</Col>
                            <Col span={16}><Input value={this.phoneValue} onChange={(e: any) => this.phoneValue = e.target.value} /></Col>
                        </Row>
                    </Spin>
                </Modal>
                <Remark
                    wrappedComponentRef={(ref: TableList) => { this.rmkComponent = ref; }}
                    editRmkId={this.editRmkId}
                    onOk={() => this.getDetail()}
                    credit={this.detail.credit}
                    id={this.id}
                    remarkCancel={() => { this.rmkVisible = false; }}
                    remarkVisible={this.rmkVisible} />
                <div style={{ width: '600px', float: 'left' }}>
                    <div style={{ fontSize: '24px', marginBottom: '15px' }}>
                        <span>{this.detail.phone}<span style={{ margin: '0 10px' }}>|</span>{this.detail.name}</span>
                        <span style={{ fontSize: '14px', marginLeft: '60px' }}>{this.detail.review_status_text}</span>
                        <div style={{ float: 'right' }}>
                            {
                                (() => {
                                    const data = this.detail;
                                    const arr = [<Tag style={{ marginBottom: '10px' }} key={1} color='#87d068'>{data.fill_status_text}</Tag>];
                                    if (data.audit_status) {
                                        arr.push(<Tag key={2} color='#87d068'>{data.audit_status_text}</Tag>);
                                    }
                                    if (data.collection_status && +data.collection_status === 2) {
                                        arr.push(<Tag key={3} color='#87d068'>{data.collection_status_text}</Tag>);
                                    }
                                    if (data.black_status && +data.black_status === 2) {
                                        arr.push(<Tag key={4} color='#87d068'>{data.black_status_text}</Tag>);
                                    }
                                    if (data.overdue_status && +data.overdue_status === 1) {
                                        arr.push(<Tag key={5} color='#87d068'>{data.overdue_status_text}</Tag>);
                                    }
                                    if (data.order_status) {
                                        arr.push(<Tag key={6} color='#87d068'>{data.order_status_text}</Tag>);
                                    }
                                    return arr;
                                })()
                            }
                        </div>
                    </div>
                    <Row>
                        <Col span={8}>未还清本金：{this.detail.unpaid_capital}</Col>
                        {/*<Col span={12}>负责人：{this.detail.channel ? this.detail.channel.name : ''}*/}
                        {/*    <a style={{ marginLeft: '15px' }}>更改客户负责人</a>*/}
                        {/*</Col>*/}
                    </Row>
                </div>
                <div style={{ width: '400px', float: 'right' }}>
                    {
                        jurisdiction.indexOf(38)  > -1 ?  <Button style={{ marginRight: 20 }} type='primary' onClick={() => this.phoneVisible = true}>更改手机号</Button> : null
                    }
                    <Popconfirm onConfirm={() => this.toblack()} title={'你确定要' + (this.detail.black_status === 2 ? '取消拉黑' : '拉黑') + '这个客户吗？'} okText='确定' cancelText='取消'>
                        {
                            jurisdiction.indexOf(36)  > -1 && this.detail.black_status !== 2 ? <Button style={{ marginRight: 20 }} type='primary'>{'拉黑'}</Button> : null
                        }
                        {
                            jurisdiction.indexOf(37) > -1 && this.detail.black_status === 2  ? <Button style={{ marginRight: 20 }} type='primary'>{'取消拉黑'}</Button> : null
                        }
                    </Popconfirm>
                    {
                        jurisdiction.indexOf(39)  > -1 ?  <Button type='primary' onClick={() => { this.rmkVisible = true; this.editRmkId = ''; }}>客户备注</Button> : null
                    }
                </div>
            </div>,
            <CardClass title='历史统计' content={history} />,
            <CardClass title='客户备注' content={remark} />,
            <CardClass title='资料信息' content={info} />,
            <CardClass title='银行卡' content={bankCard} />,
            <CardClass title='注册信息' content={register} />,
            <CardClass title='操作记录' content={handle} />,
        ];
        return (
            <Title component={component} />
        );
    }
}
export default withAppState(Detail);
