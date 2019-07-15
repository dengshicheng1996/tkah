import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import { mutate } from 'common/component/restFull';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
const Option = Select.Option;
@observer
export default class Product extends React.Component<{}, any> {
    @observable private product_id: any = '';
    @observable private limitFields: any[] = [{value: ''}];
    @observable private limitEdit: boolean = false;
    @observable private orderFields: any[] = [{dayValue: '', principalRatioValue: '', interestRatioValue: ''}];
    @observable private orderEdit: boolean = false;
    @observable private exhibitionFields: any = {exhibitionRatioValue: undefined, allow: undefined, dayValue: undefined};
    @observable private exhibitionEdit: boolean = false;
    @observable private interestFields: any = {dayRate: '', max: ''};
    @observable private interestEdit: boolean = false;
    @observable private chargeFields: any[] = [{nameValue: '', amountSelect: '', amountInput: '', paymentValue: ''}];
    @observable private chargeEdit: boolean = false;
    @observable private auditEdit: boolean = false;
    @observable private auditFields: any = {audit_level: undefined, is_black: undefined};
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        this.getData().then(r => {
            if (!r.data.serviceCharge || r.data.serviceCharge.length === 0) {
                this.chargeEdit = true;
                this.chargeFields = [{nameValue: '', amountSelect: '', amountInput: '', paymentValue: ''}];
            }
        });
    }
    getData() {
        return mutate<{}, any>({
            url: '/api/admin/basicconfig/product/products',
            method: 'get',
        }).then(r => {
            if (r.status_code === 200) {
                this.product_id = r.data.product_id;
                this.limitFields = r.data.grantLimitRule.map((item: any) => {
                    return {value: item.amount};
                });
                this.orderFields = r.data.period.map((item: any) => {
                    return {dayValue: item.day_num, principalRatioValue: item.repay_capital_rate, interestRatioValue: item.repay_interest_rate};
                });
                this.chargeFields = r.data.serviceCharge.map((item: any) => {
                    return {nameValue: item.name, amountSelect: item.type + '', amountInput: item.value, paymentValue: item.payment + ''};
                });
                this.interestFields = {dayRate: r.data.faxi.faxi_day_rate, max: r.data.faxi.faxi_upper_limit};
                this.exhibitionFields = {exhibitionRatioValue: r.data.extension.extension_charge, dayValue: r.data.extension.extension_time, allow: r.data.extension.is_self_extension};
                this.auditFields = {audit_level: r.data.auditRules.audit_level, is_black: r.data.auditRules.is_black};
            }
            return r;
        });
    }
    saveLimit() {
        if ( !this.limitEdit ) {
            this.limitEdit = true;
            return true;
        }
        let error = '';
        const grantLimitRule = this.limitFields.map((item, index) => {
            if (item.value === '') {
                error = '请填写正确的额度规则';
            }
            return {loan_num: index, amount: item.value};
        });
        if (error) {
           return message.error(error);
        }
        const json = {
            product_id: this.product_id,
            grantLimitRule,
        };
        mutate<{}, any>({
            url: '/api/admin/basicconfig/product/grantlimitrules',
            method: 'post',
            variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                this.limitEdit = false;
                this.getData();
                message.success('操作成功');
            } else {
                message.error(r.message);
            }
        });
    }
    saveOrder() {
        if ( !this.orderEdit ) {
            this.orderEdit = true;
            return true;
        }
        let error: string = '';
        let num: number = 0;
        const period = this.orderFields.map((item, index) => {
            num += +item.principalRatioValue;
            return {period: index + 1, day_num: item.dayValue, repay_capital_rate: item.principalRatioValue, repay_interest_rate: item.interestRatioValue};
        });
        if (num !== 100) {
            error = '【应还本金比例】之和应等于100%';
        }
        if (error) {
            return message.error(error);
        }
        const json = {
            product_id: this.product_id,
            period,
        };
        mutate<{}, any>({
            url: '/api/admin/basicconfig/product/periods',
            method: 'post',
            variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                this.getData();
                this.orderEdit = false;
                message.success('操作成功');
            } else {
                message.error(r.message);
            }
        });
    }
    saveCharge() {
        if ( !this.chargeEdit ) {
            this.chargeEdit = true;
            return true;
        }
        let error: string = '';
        const serviceCharge = this.chargeFields.map((item, index) => {
            if (item.nameValue === ''
                || item.amountSelect === ''
                || item.amountInput === ''
                || item.paymentValue === ''
                || item.nameValue === undefined
                || item.amountSelect === undefined
                || item.amountInput === undefined
                || item.paymentValue === undefined
            ) {
                error = '您存在未填写项';
            }
            if (item.amountSelect === '2' && item.amountInput > 100) {
                error = '请填写正确的借款金额比例';
            }
            if (item.amountSelect === '1' && !/^(([1-9]\d*)|\d)(\.\d{1,2})?$/g.test(item.amountInput)) {
                error = '请填写正确的金额';
            }
            return {name: item.nameValue, type: item.amountSelect, value: item.amountInput, payment: item.paymentValue};
        });
        if (error) {
            return message.error(error);
        }
        const json = {
            product_id: this.product_id,
            serviceCharge,
        };
        mutate<{}, any>({
            url: '/api/admin/basicconfig/product/servicecharges',
            method: 'post',
            variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                this.chargeEdit = false;
                message.success('操作成功');
            } else {
                message.error(r.message);
            }
        });
    }
    saveInterest() {
        if ( !this.interestEdit ) {
            this.interestEdit = true;
            return true;
        }
        const json = {
            product_id: this.product_id,
            faxi_day_rate: this.interestFields.dayRate,
            faxi_upper_limit: this.interestFields.max,
        };
        let error = '';
        if (!/^(([1-9]\d*)|\d)(\.\d{1,})?$/.test(this.interestFields.dayRate)) {
            error = '请填写正确的罚息日利率';
        }
        if (!/^(([1-9]\d*)|\d)(\.\d{1,})?$/.test(this.interestFields.max)) {
            error = '请填写正确的罚息最高上限';
        }
        if (error) {
            return message.error(error);
        }
        mutate<{}, any>({
            url: '/api/admin/basicconfig/product/faxis/' + this.product_id,
            method: 'put',
            variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                message.success('操作成功');
                this.interestEdit = false;
            } else {
                message.error(r.message);
            }
        });
    }
    saveExhibition() {
        if ( !this.exhibitionEdit ) {
            this.exhibitionEdit = true;
            return true;
        }
        const json = {
            product_id: this.product_id,
            extension_charge: this.exhibitionFields.exhibitionRatioValue,
            extension_time: this.exhibitionFields.dayValue,
            is_self_extension: this.exhibitionFields.allow,
        };
        let error = '';
        if (!/^(([1-9]\d*)|\d)(\.\d{1,})?$/.test(this.exhibitionFields.exhibitionRatioValue)) {
            error = '请填写正确的展期费用';
        }
        if (!/^(([1-9]\d*)|\d)?$/.test(this.exhibitionFields.dayValue)) {
            error = '请填写正确的展期时间';
        }
        if (error) {
            return message.error(error);
        }
        mutate<{}, any>({
            url: '/api/admin/basicconfig/product/extensions/' + this.product_id,
            method: 'put',
            variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                this.exhibitionEdit = false;
                message.success('操作成功');
            } else {
                message.error(r.message);
            }
        });
    }
    saveAudit() {
        if ( !this.auditEdit ) {
            this.auditEdit = true;
            return true;
        }
        const json = {
            product_id: this.product_id,
            audit_level: this.auditFields.audit_level,
            is_black: this.auditFields.is_black,
        };
        mutate<{}, any>({
            url: '/api/admin/basicconfig/product/audit',
            method: 'post',
            variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                this.auditEdit = false;
                message.success('操作成功');
            } else {
                message.error(r.message);
            }
        });
    }
    render() {
        const limitContent = (
            <div>
                {
                    this.limitFields.map((item, index) => {
                        return (<Row key={index} style={this.limitEdit ? {paddingBottom: '20px', lineHeight : '31px', marginBottom: '20px' , borderBottom: '1px solid #eee'} : {lineHeight : '31px', marginBottom: '20px'}}>
                                    <Col span={3}>
                                        {
                                            index === 0 ? '首次借款额度:' : index + 1 + '次借款额度:'
                                        }
                                    </Col>
                                    <Col span={7}>
                                        { this.limitEdit
                                            ?
                                            <Input  placeholder='请输入' style={{width: '200px'}} onChange={(e) => this.limitFields[index].value = e.target.value} value={item.value}/>
                                            :
                                            this.limitFields[index].value
                                        }
                                        <span style={{marginLeft: '20px'}}>（元）</span>
                                    </Col>
                                    <Col span={14}>
                                        {
                                            !this.limitEdit || index === 0 ? '' : <Button  style={{float: 'right'}} onClick={() => this.limitFields.splice(index, 1)}>删除</Button>
                                        }
                                    </Col>
                                </Row>);
                    })
                }
                <div style={{float: 'right'}}>
                    {this.limitEdit && <Button onClick={() => {
                        this.limitFields.push({value: ''});
                    }}>添加续借次数</Button> }
                </div>
            </div>
        );
        const orderContent = (
            <div>
                {
                    this.orderFields.map((item, index) => {
                        return (<Row key={index} style={this.orderEdit ? {borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px', lineHeight : '31px'} : {marginBottom: '20px', lineHeight : '31px'}}>
                            <Col span={1} style={{ textAlign: 'left'}}>
                                第{index + 1}期
                            </Col>
                            <Col span={2} style={{ textAlign: 'left' }}>
                                账单天数：
                            </Col>
                            <Col span={2} style={{ textAlign: 'left'}}>
                                {
                                    this.orderEdit
                                    ?
                                    <Input placeholder='请输入' style={{ width: '80px'}} onChange={(e) => this.orderFields[index].dayValue = e.target.value} value={item.dayValue}/>
                                    :
                                    this.orderFields[index].dayValue
                                }
                            </Col>
                            <Col span={7} style={{lineHeight : '31px', textAlign: 'right', marginLeft: '-20px'}}>
                                应还本金比例（占授信金额百分比）：
                            </Col>
                            <Col span={2}  style={{ textAlign: 'left'}}>
                                {
                                    this.orderEdit
                                        ?
                                        <Input  placeholder='请输入' style={{ width: '80px'}} onChange={(e) => this.orderFields[index].principalRatioValue = e.target.value} value={item.principalRatioValue}/>
                                        :
                                        this.orderFields[index].principalRatioValue
                                }
                            </Col>
                            <Col span={7} style={{lineHeight : '31px', textAlign: 'right', marginLeft: '-20px'}}>
                                应还利息比例（占授信金额百分比）：
                            </Col>
                            <Col span={2}   style={{ textAlign: 'left'}}>
                                {
                                    this.orderEdit
                                        ?
                                        <Input placeholder='请输入' style={{ width: '80px'}} onChange={(e) => this.orderFields[index].interestRatioValue = e.target.value} value={item.interestRatioValue}/>
                                        :
                                        this.orderFields[index].interestRatioValue
                                }
                            </Col>
                            <Col>
                                {
                                    !this.orderEdit || index === 0 ? '' : <Button  style={{float: 'right'}} onClick={() => this.orderFields.splice(index, 1)}>删除</Button>
                                }
                            </Col>
                        </Row>);
                    })
                }
                <div style={{float: 'right'}}>
                    {this.orderEdit && <Button onClick={() => {
                        this.orderFields.push({dayValue: '', principalRatioValue: '', interestRatioValue: ''});
                    }}>添加账单</Button>}
                </div>
            </div>
        );
        const chargeContent = (
            <div>
                {
                    this.chargeFields.map((item, index) => {
                        return (<Row key={index} style={{borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px', lineHeight: '31px'}}>
                            <Col span={6} style={{ textAlign: 'left'}}>
                                名称：{
                                this.chargeEdit
                                ?
                                <Input placeholder='请输入' style={{ width: '170px'}} onChange={(e) => this.chargeFields[index].nameValue = e.target.value} value={item.nameValue}/>
                                :
                                this.chargeFields[index].nameValue
                            }
                            </Col>
                            <Col span={9}  style={{ textAlign: 'left'}}>
                                金额设置：
                                {
                                    this.chargeEdit
                                    ?
                                    <div style={{display: 'inline-block'}}>
                                        <Select placeholder='请选择' value={item.amountSelect} onChange={(data) => this.chargeFields[index].amountSelect = data} style={{width: 150, margin: '0 20px 0 0'}}>
                                            <Option value='2'>借款金额比例（%）</Option>
                                            <Option value='1'>固定金额（元）</Option>
                                        </Select>
                                        <Input  placeholder='请输入' style={{ width: '80px'}} onChange={(e) => this.chargeFields[index].amountInput = e.target.value} value={item.amountInput}/>
                                    </div>
                                    :
                                    (this.chargeFields[index].amountSelect + '' === '2' ?  '借款金额比例（%）' : '固定金额（元）') + ',' + this.chargeFields[index].amountInput
                                }
                            </Col>
                            <Col span={7}   style={{ textAlign: 'left'}}>
                                支付方式：
                                {
                                    this.chargeEdit
                                    ?
                                    <Select placeholder='请选择' value={item.paymentValue} onChange={(data) => this.chargeFields[index].paymentValue = data} style={{width: 140, margin: '0 20px 0 10px'}}>
                                        <Option value='3'>放款后支付</Option>
                                        <Option value='1'>按期支付</Option>
                                        <Option value='2'>放款前扣款</Option>
                                    </Select>
                                    :
                                        +this.chargeFields[index].paymentValue === 3 ? '放款后支付' : +this.chargeFields[index].paymentValue === 1 ? '按期支付' : '放款前扣款'
                                }
                            </Col>
                            <Col>
                                {
                                    this.chargeEdit ? <Button  style={{float: 'right'}} onClick={() => this.chargeFields.splice(index, 1)}>删除</Button> : null
                                }
                            </Col>
                        </Row>);
                    })
                }
                <div style={{float: 'right'}}>
                    {
                        this.chargeEdit && <Button onClick={() => {
                            this.chargeFields.push({nameValue: undefined, amountSelect: undefined, amountInput: undefined, paymentValue: undefined});
                        }}>添加手续费</Button>
                    }
                </div>
            </div>
        );
        const interestContent = (
            <div>
                 <Row style={{paddingBottom: '20px', marginBottom: '20px', lineHeight: '31px'}}>
                    <Col span={6} style={{lineHeight : '31px',  textAlign: 'right'}}>
                        罚息日利率（%）：
                    </Col>
                     <Col span={5} style={{ textAlign: 'left'}}>
                         {
                             this.interestEdit ? <Input style={{ width: '160px'}} onChange={(e) => this.interestFields.dayRate = e.target.value} value={this.interestFields.dayRate}/> : this.interestFields.dayRate
                         }
                     </Col>
                    <Col span={6} style={{ textAlign: 'right', lineHeight : '31px'}}>
                        罚息最高上限（占本金百分比）：
                    </Col>
                    <Col span={4} style={{ textAlign: 'left'}}>
                        {
                            this.interestEdit ? <Input style={{ width: '160px'}} onChange={(e) => this.interestFields.max = e.target.value} value={this.interestFields.max}/> : this.interestFields.max
                        }
                    </Col>
                </Row>
            </div>
        );
        const exhibitionContent = (
            <div>
                <Row style={{ marginBottom: '20px', lineHeight: '31px'}}>
                    <Col span={6} style={{ textAlign: 'right', lineHeight : '31px'}}>
                        展期费用（占账单本金百分比）：
                    </Col>
                    <Col span={5} style={{ textAlign: 'left'}}>
                        {
                            this.exhibitionEdit ? <Input style={{ width: '120px'}} onChange={(e) => this.exhibitionFields.exhibitionRatioValue = e.target.value} value={this.exhibitionFields.exhibitionRatioValue}/>
                            : this.exhibitionFields.exhibitionRatioValue
                        }
                        <span style={{marginLeft: '20px'}}>（%）</span>
                    </Col>
                    <Col span={2} style={{ textAlign: 'right', lineHeight : '31px'}}>
                        展期时间：
                    </Col>
                    <Col span={5} style={{ textAlign: 'left'}}>
                        {
                            this.exhibitionEdit ? <Input style={{ width: '120px'}} onChange={(e) => this.exhibitionFields.dayValue = e.target.value} value={this.exhibitionFields.dayValue}/>
                            : this.exhibitionFields.dayValue
                        }
                        <span style={{marginLeft: '20px'}}>（天）</span>
                    </Col>
                </Row>
                <Row style={{ paddingBottom: '20px', marginBottom: '20px', lineHeight: '31px'}}>
                    <Col span={6} style={{ textAlign: 'right', lineHeight : '31px'}}>
                        借款人是否可以自己展期：
                    </Col>
                    <Col span={8} style={{ textAlign: 'left'}}>
                        {
                            this.exhibitionEdit
                                ?
                                <Select  placeholder='请选择'  style={{ width: '160px'}} onChange={(data) => this.exhibitionFields.allow = data} value={this.exhibitionFields.allow + ''}>
                                    <Option value='1'>允许</Option>
                                    <Option value='0'>不允许</Option>
                                </Select>
                                :
                                +this.exhibitionFields.allow  === 1 ? '允许' : '不允许'
                        }
                    </Col>
                </Row>
            </div>
        );
        const auditContent = (
            <div>
                <Row style={{ paddingBottom: '20px', marginBottom: '20px', lineHeight: '31px'}}>
                    <Col span={5} style={{ textAlign: 'right', lineHeight : '31px'}}>
                        机审通过后是否需要人工审核：
                    </Col>
                    <Col span={7} style={{ textAlign: 'left'}}>
                        {
                            this.auditEdit
                                ?
                                <Select placeholder='请选择'  style={{ width: '160px'}} onChange={(data) => this.auditFields.audit_level = data} value={this.auditFields.audit_level + ''}>
                                    <Option value='1'>否</Option>
                                    <Option value='2'>是</Option>
                                </Select>
                                :
                                this.auditFields.audit_level === undefined ? '' : +this.auditFields.audit_level  === 1 ? '否' : '是'
                        }
                    </Col>
                    <Col span={5} style={{ textAlign: 'right', lineHeight : '31px'}}>
                        拒贷后是否拉黑：
                    </Col>
                    <Col span={7} style={{ textAlign: 'left'}}>
                        {
                            this.auditEdit
                                ?
                                <Select placeholder='请选择'  style={{ width: '160px'}} onChange={(data) => this.auditFields.is_black = data} value={this.auditFields.is_black}>
                                    <Option value={1}>是</Option>
                                    <Option value={0}>否</Option>
                                </Select>
                                :
                                this.auditFields.is_black === undefined ? '' : +this.auditFields.is_black  === 1 ? '是' : '否'
                        }
                    </Col>
                </Row>
            </div>
        );
        return (
            <div>
                <CardClass title='授信额度规则' topButton={<Button type='primary' onClick={() => this.saveLimit()}>{this.limitEdit ? '保存' : '编辑'}</Button>} content={limitContent} />
                <CardClass title='账单配置' topButton={<Button type='primary' onClick={() => this.saveOrder()}>{this.orderEdit ? '保存' : '编辑'}</Button>} content={orderContent} />
                <CardClass title='手续费' topButton={<Button type='primary' onClick={() => this.saveCharge()}>{this.chargeEdit ? '保存' : '编辑'}</Button>} content={chargeContent} />
                <CardClass title='罚息' topButton={<Button type='primary' onClick={() => this.saveInterest()}>{this.interestEdit ? '保存' : '编辑'}</Button>} content={interestContent} />
                <CardClass title='展期配置' topButton={<Button type='primary' onClick={() => this.saveExhibition()}>{this.exhibitionEdit ? '保存' : '编辑'}</Button>} content={exhibitionContent}/>
                <CardClass title='审核配置' topButton={<Button type='primary' onClick={() => this.saveAudit()}>{this.auditEdit ? '保存' : '编辑'}</Button>} content={auditContent}/>
            </div>
        );
    }

}
class CardClass extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
                <div style={{marginBottom: '20px'}}>
                    <Card
                        headStyle={{borderBottom: 'none'}}
                        title={<span style={{color: '#0099FF', borderBottom: '3px solid #0099FF', padding: '0 0px 10px 0', display: 'inline-block', width: 120}}>{this.props.title}</span>}
                        extra={this.props.topButton}
                    >
                        {
                            this.props.content
                        }
                    </Card>
                </div>
        );
    }
}
