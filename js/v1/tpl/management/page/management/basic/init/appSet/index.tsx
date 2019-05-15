import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import {Spin} from 'common/antd/spin';
import {BaseForm} from 'common/formTpl/baseForm';
import { mutate } from 'common/restFull';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
const Option = Select.Option;

interface AppSetPropsType {
    form: any;
}
@observer
class AppSetComponent extends React.Component<AppSetPropsType, any> {
    @observable private loading: boolean = false;
    @observable private edit: boolean = false;
    @observable private productNameValue: string = '';
    @observable private productName: string = '';
    @observable private phone: string|number = '';
    @observable private phoneValue: string|number = '';
    @observable private limitValue: string|number = '';
    @observable private limit: string|number = '';

    constructor(props: any) {
        super(props);
    }
    // componentDidMount() {
    //
    // }
    save() {
        const json = {};
        mutate<{}, any>({
            url: '/api/admin/basicconfig/product/grantLimitRules',
            method: 'post',
            variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                message.success('操作成功');
                this.edit = false;
            } else {
                message.error(r.message);
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
        const rowStyle = {
            marginBottom: '20px',
        };
        const leftSpan = 5;
        const rightSpan = 5;
        const content = (
            <div  style={{lineHeight: '33px'}}>
                <Spin spinning={this.loading}>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{textAlign: 'right'}}>产品名字：</Col>
                        <Col span={rightSpan}>{!this.edit ? this.productName : <Input value={this.productNameValue} onChange={(e) => this.productNameValue = e.target.value}/>}</Col>
                    </Row>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{textAlign: 'right'}}>客服电话：</Col>
                        <Col span={rightSpan}>{!this.edit ? this.phone : <Input value={this.phoneValue} onChange={(e) => this.phoneValue = e.target.value}/>}</Col>
                    </Row>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{textAlign: 'right'}}>最高授信额度：</Col>
                        <Col span={rightSpan}>{!this.edit ? this.limit : <Input value={this.limitValue} onChange={(e) => this.limitValue = e.target.value}/>}</Col>
                    </Row>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{textAlign: 'right'}}>顶部宣传图（ 750*320）：</Col>
                        <Col span={rightSpan}></Col>
                    </Row>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{textAlign: 'right'}}>底部宣传图（679*176）：</Col>
                        <Col span={rightSpan}></Col>
                    </Row>
                    <Row style={rowStyle}>
                        <Col span={leftSpan} style={{textAlign: 'right'}}>疑问咨询图（679*176）：</Col>
                        <Col span={rightSpan}></Col>
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
