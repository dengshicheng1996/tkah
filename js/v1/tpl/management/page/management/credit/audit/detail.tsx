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
import {mutate} from 'common/component/restFull';
import { SearchTable } from 'common/component/searchTable';
import {BaseForm} from 'common/formTpl/baseForm';
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

@observer
export default class Audit extends React.Component<{}, any> {
    @observable private auditVisible: boolean = false;
    @observable private id: string|number = '';
    @observable private loading: boolean = false;
    @observable private passVisible: boolean = false;
    @observable private rejectVisible: boolean = false;
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
    async pass() {
        const res: any = await mutate<{}, any>({
            url: '/api/admin/passed/' + this.id,
            method: 'post',
        });
        this.loading = false;
        if (res.status_code === 200) {
            message.success('操作成功');
            this.getDetail();
        } else {
            message.error(res.message);
        }
    }
    async reject() {
        // const json = {
        //     warningAmount: +this.amountWarnValue,
        // };
        // const res: any = await mutate<{}, any>({
        //     url: '/api/admin/payment/selectwarning',
        //     method: 'post',
        //     variables: json,
        // });
        // this.loading = false;
        // if (res.status_code === 200) {
        //     message.success('操作成功');
        //     this.warnEdit = false;
        //     this.getAmount();
        // } else {
        //     message.error(res.message);
        // }
    }
    async remark() {
        // const json = {
        //     warningAmount: +this.amountWarnValue,
        // };
        // const res: any = await mutate<{}, any>({
        //     url: '/api/admin/payment/selectwarning',
        //     method: 'post',
        //     variables: json,
        // });
        // this.loading = false;
        // if (res.status_code === 200) {
        //     message.success('操作成功');
        //     this.warnEdit = false;
        //     this.getAmount();
        // } else {
        //     message.error(res.message);
        // }
    }
    render() {
        const remarkColumn = [
            {title: '备注时间', key: 'created_at', dataIndex: 'created_at'},
            {title: '操作人', key: 'account_name', dataIndex: 'account_name'},
            {title: '备注内容', key: 'content', dataIndex: 'content'},
        ];
        const creditColumn = [
            {title: '时间', key: 'created_at', dataIndex: 'created_at'},
            {title: '操作人', key: 'account_name', dataIndex: 'account_name'},
            {title: '内容', key: 'content', dataIndex: 'content'},
        ];
        const historyColumn = [
            {title: '申请日期', key: 'apply_at', dataIndex: 'apply_at'},
            {title: '审核结果', key: 'review_content', dataIndex: 'review_content'},
            {title: '提现状态', key: 'withdraw', dataIndex: 'withdraw'},
            {title: '借款日期', key: 'loan_at', dataIndex: 'loan_at'},
            {title: '逾期次数', key: 'overdue_num', dataIndex: 'overdue_num'},
            {title: '展期次数', key: 'extension_num', dataIndex: 'extension_num'},
            {title: '结清日期', key: 'settle_at', dataIndex: 'settle_at'},
        ];
        const resultColumn = [
            {title: '命中规则', key: 'rule_name', dataIndex: 'rule_name'},
            {title: '规则标准', key: 'rule_standard', dataIndex: 'rule_standard'},
            {title: '借款人数据', key: 'risk_result', dataIndex: 'risk_result'},
        ];
        const result = <div>
            <Row style={{fontSize: 22, marginBottom: 24}}>
                <Col span={6}>机审结果：{this.detail.risk_report ? this.detail.risk_report.review_status_text : ''}</Col>
                <Col span={6}>风控建议：{this.detail.risk_report ? this.detail.risk_report.recommend : ''}</Col>
                <Col span={6}>风险评级：{this.detail.risk_report ? this.detail.risk_report.rating : ''}</Col>
                <Col span={6}>评分：{this.detail.risk_report ? this.detail.risk_report.score : ''}</Col>
            </Row>
            <Table columns={resultColumn} dataSource={this.detail.risk_rule || []} pagination={false} />
        </div>;
        const history = <div>
            <Row style={{marginBottom: 24}}>
                <Col span={4}>申请次数：{this.detail.customer_extra ? this.detail.customer_extra.apply_num : ''}</Col>
                <Col span={4}>通过次数：{this.detail.customer_extra ? this.detail.customer_extra.pass_num : ''}</Col>
                <Col span={4}>拒绝次数：{this.detail.customer_extra ? this.detail.customer_extra.reject_num : ''}</Col>
                <Col span={4}>借款次数：{this.detail.customer_extra ? this.detail.customer_extra.loan_num : ''}</Col>
                <Col span={4}>逾期次数：{this.detail.customer_extra ? this.detail.customer_extra.overdue_num : ''}</Col>
                <Col span={4}>展期次数：{this.detail.customer_extra ? this.detail.customer_extra.extension_num : ''}</Col>
            </Row>
            <Table columns={historyColumn} dataSource={this.detail.apply_history || []} pagination={false} />
        </div>;
        const info = <div>344</div>;
        const credit = <div>
            <Table columns={creditColumn} dataSource={this.detail.credit_record || []} pagination={false}/>
        </div>;
        const remark = <div>
            <Table columns={remarkColumn} dataSource={this.detail.credit_remark || []} pagination={false}/>
        </div>;
        const component = [
            <div>
                <div>
                    <Button type='primary' onClick={() => this.passVisible = true}>通过</Button>
                    <Button type='primary' onClick={() => this.rejectVisible = true}>拒绝</Button>
                    <Button type='primary' onClick={() => this.remark()}>客户备注</Button>
                </div>
            </div>,
            <CardClass title='机审风控结果' content={result} />,
            <CardClass title='历史统计' content={history} />,
            <CardClass title='资料信息' content={info} />,
            <CardClass title='客户备注' content={remark} />,
            <CardClass title='授信记录' content={credit} />,
            <div>
                <Modal
                title={'审核通过'}
                visible={this.passVisible}
                onOk={() => this.pass()}
                onCancel={() => this.passVisible = false}
                >
                    <Row>
                        <Col>额度：</Col>
                        <Col><Input disabled value={this.detail.credit ? this.detail.credit.credit_amount : ''} /></Col>
                    </Row>
                    <Row>
                        <Col>额度有效期：</Col>
                        <Col><DatePicker disabled value={moment(this.detail.credit ? this.detail.credit.expired_at_text : '')} /></Col>
                    </Row>
                </Modal>
                <Modal
                    title={'审核拒绝'}
                    visible={this.rejectVisible}
                    onOk={() => this.reject()}
                    onCancel={() => this.rejectVisible = false}
                >
                    <Row>
                        <Col>是否拉黑：</Col>
                        <Col>
                            <Select value={this.black} onChange={(value) => this.black = value}>
                                <Select.Option value={1}>拉黑</Select.Option>
                                <Select.Option value={2}>不拉黑</Select.Option>
                            </Select>
                        </Col>
                    </Row>
                    <Row>
                        <Col>拒绝有效期：</Col>
                        <Col><DatePicker disabled value={moment(this.detail.credit ? this.detail.credit.expired_at_text : '')} /></Col>
                    </Row>
                </Modal>
            </div>,
        ];
        return (
                <Title component={component}/>
        );
    }
}
