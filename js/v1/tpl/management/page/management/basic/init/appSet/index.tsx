import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Row } from 'common/antd/row';
import { Spin } from 'common/antd/spin';
import { mutate } from 'common/component/restFull';
import UploadComponent from 'common/component/UploadComponent';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
interface AppSetPropsType {
    form: any;
}
@observer
class AppSetComponent extends React.Component<AppSetPropsType, any> {
    @observable private loading: boolean = false;
    @observable private edit: boolean = false;
    @observable private id: string | number = '';
    @observable private top_banner_img: string = '';
    @observable private productName: string = '';
    @observable private phone: string | number = '';
    @observable private bottom_banner_img: string  = '';
    @observable private consultation_img: string  = '';
    @observable private limit: string | number = '';

    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        mutate<{}, any>({
            url: '/api/admin/basicconfig/appconfig',
            method: 'get',
        }).then(r => {
            this.id = r.data.id;
            this.productName = r.data.product_name;
            this.phone = r.data.customer_service_phone;
            this.limit = r.data.audit_loan_amount_max;
            this.top_banner_img = r.data.top_banner_img;
            this.bottom_banner_img = r.data.bottom_banner_img;
            this.consultation_img = r.data.consultation_img;
        });
    }
    save() {
        const that = this;
        const url = this.id ? '/api/admin/basicconfig/appconfig/' + this.id + '/edit' : '/api/admin/basicconfig/appconfig';
        const method = this.id ? 'put' : 'post';
        const json: any = {
            product_name: this.productName,
            audit_loan_amount_max: this.limit,
            customer_service_phone: this.phone,
            top_banner_img: this.top_banner_img,
            bottom_banner_img: this.bottom_banner_img,
            consultation_img: this.consultation_img,
        };
        if(!this.productName || !this.limit || !this.phone || !this.top_banner_img || !this.bottom_banner_img || !this.consultation_img) {
            return message.error('您有未填项，请检查');
        }
        if (this.id) {
            json.id = this.id;
        }
        mutate<{}, any>({
            url,
            method,
            variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                message.success('操作成功');
                that.edit = false;
            } else {
                message.error(r.message);
            }
        });
    }
    render() {
        const imgStyle = {
            width: '300px',
            height: '100px',
            marginBottom: '10px',
        };
        const rowStyle = {
            marginBottom: '20px',
        };
        const leftSpan = 5;
        const rightSpan = 5;
        const content = (
            <div style={{ lineHeight: '33px' }}>
                <Spin spinning={this.loading}>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{ textAlign: 'right' }}>产品名字：</Col>
                        <Col span={rightSpan}>{!this.edit ? this.productName : <Input value={this.productName} onChange={(e) => this.productName = e.target.value} />}</Col>
                    </Row>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{ textAlign: 'right' }}>客服电话：</Col>
                        <Col span={rightSpan}>{!this.edit ? this.phone : <Input value={this.phone} onChange={(e) => this.phone = e.target.value} />}</Col>
                    </Row>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{ textAlign: 'right' }}>最高授信额度：</Col>
                        <Col span={rightSpan}>{!this.edit ? this.limit : <Input value={this.limit} onChange={(e) => this.limit = e.target.value} />}</Col>
                    </Row>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{ textAlign: 'right' }}>顶部宣传图（ 750*320）：</Col>
                        <Col span={rightSpan}><img style={imgStyle} src={this.top_banner_img} />{this.edit && <UploadComponent accept={'image/*'} complete={(url: string) => this.top_banner_img = url} />}</Col>
                    </Row>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{ textAlign: 'right' }}>底部宣传图（679*176）：</Col>
                        <Col span={rightSpan}><img style={imgStyle} src={this.bottom_banner_img} />{this.edit && <UploadComponent accept={'image/*'} complete={(url: string) => this.bottom_banner_img = url} />}</Col>
                    </Row>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{ textAlign: 'right' }}>疑问咨询图（679*176）：</Col>
                        <Col span={rightSpan}><img style={imgStyle} src={this.consultation_img} />{this.edit && <UploadComponent accept={'image/*'} complete={(url: string) => this.consultation_img = url} />}</Col>
                    </Row>
                </Spin>
            </div>
        );
        return (
            <div>
                <CardClass title='App设置' topButton={this.edit ? <Button type='primary' onClick={() => this.save()}>保存</Button> : <Button type='primary' onClick={() => this.edit = true}>编辑</Button>} content={content} />
            </div>
        );
    }

}
const ExportViewCom = Form.create()(AppSetComponent);
export default ExportViewCom;

class CardClass extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <div style={{ marginBottom: '20px' }}>
                <Card
                    headStyle={{ borderBottom: 'none' }}
                    title={<span style={{ color: '#0099FF', borderBottom: '3px solid #0099FF', padding: '0 0px 10px 0', display: 'inline-block', width: 120 }}>{this.props.title}</span>}
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
