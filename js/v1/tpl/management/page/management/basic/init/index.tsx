import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import { Spin } from 'common/antd/spin';
import { mutate } from 'common/component/restFull';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import Title from '../../../../common/TitleComponent';
import appSet from './appSet';
import clientInfo from './clientInfo';
import contract from './contract';
import product from './product';
import signature from './signature';
import {objectToOption} from "../../../../../common/tools";
const Option = Select.Option;

interface AuditProp {
    visible: boolean;
    form: any;
    setVisible: any;
}
@observer
class AuditComponent extends React.Component<AuditProp, any> {
    @observable private initFields: any[];
    @observable private loading: boolean = false;
    constructor(props: any) {
        super(props);
    }
    onOk() {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                const json: any = _.assign({}, values);
                mutate<{}, any>({
                    url: '/api/admin/account/users',
                    method: 'post',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        message.success('操作成功');
                        this.props.setVisible(false);
                        this.props.form.resetFields();
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
        const formItem: Array<TypeFormItem | ComponentFormItem> = [
            { key: 'audit_level', type: 'select', itemProps: { label: '机审通过后是否需要人工审核' }, options: [{ label: '不需要', value: '0' }, { label: '需要', value: '1' }] },
            { key: 'renew_audit_auto', type: 'select', itemProps: { label: '续借是否使用机审' }, options: [{ label: '不使用', value: '0' }, { label: '使用', value: '1' }] },
            { key: 'name', type: 'select', itemProps: { label: '拒贷后是否拉黑' }, options: [{ label: '拉黑', value: '1' }, { label: '暂时拒绝', value: '0' }] },
            { key: 'black_day', type: 'input', itemProps: { label: '拒绝期限' } },
        ];
        const formLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 12 },
            },
        };
        return (
            <div style={{ marginBottom: '20px' }}>
                <Modal
                    width={700}
                    title='审核规则'
                    onOk={() => this.onOk()}
                    onCancel={() => { this.props.setVisible(false); this.props.form.resetFields(); }}
                    visible={this.props.visible}
                >
                    <Spin spinning={this.loading}>
                        <BaseForm formItemLayout={formLayout} form={this.props.form} item={formItem} />
                    </Spin>
                </Modal>
            </div>
        );
    }
}
const Audit: any = Form.create()(AuditComponent);

@observer
export default class Product extends React.Component<{}, any> {
    @observable private auditVisible: boolean = false;
    @observable private initFields: any[] = [
        { title: '产品配置', status: false, icon: 'project', key: 'product', url: '/management/basic/init/product' },
        { title: '合同签章', status: false, icon: 'profile', key: 'capitalists', url: '/management/basic/init/signature' },
        { title: '合同配置', status: false, icon: 'read', key: 'contract', url: '/management/basic/init/contract' },
        // { title: '客户资料', status: false, icon: 'solution', key: 'customer', url: '/management/basic/init/clientInfo' },
        // { title: '审核授信规则', status: false, icon: false, key: false, component: true },
        { title: 'App配置', status: false, icon: 'appstore', key: 'app', url: '/management/basic/init/appSet' },
    ];
    constructor(props: any) {
        super(props);
    }
    async componentDidMount() {
        const res: any = await mutate<{}, any>({
            url: '/api/admin/basicconfig/state',
            method: 'get',
        });
        const data: any = res.data;
        const arr: any[] = [];
        this.initFields.map((item: any) => {
            if (data[item.key]) {
                item.status = true;
            }
            arr.push(item);
        });
        this.initFields = arr;
        this.forceUpdate();
    }
    render() {
        return (
            <Title>
                <Switch>
                    <Route exact path='/management/basic/init/product' component={product} />
                    <Route exact path='/management/basic/init/contract' component={contract} />
                    <Route exact path='/management/basic/init/appSet' component={appSet} />
                    <Route exact path='/management/basic/init/clientInfo' component={clientInfo} />
                    <Route exact path='/management/basic/init/signature' component={signature} />
                    <Route render={() => <div style={{ minHeight: 450 }}>
                        <Row>
                            {
                                this.initFields.map((item, index) => {
                                    return <div key={index}>
                                        {
                                            item.component ?
                                                <div>
                                                    <div onClick={() => {
                                                        this.auditVisible = true;
                                                    }}>
                                                        <h2>{item.title}</h2>
                                                        <div>{!item.status ? '未配置' : ''}</div>
                                                    </div>
                                                    <Audit setVisible={(bol: boolean) => this.auditVisible = bol}
                                                        visible={this.auditVisible} />
                                                </div>
                                                :
                                                <Link to={item.url}>
                                                    <Col span={4} style={{ textAlign: 'center' }}>
                                                        <Icon style={{ fontSize: '40px', marginBottom: '10px' }}
                                                            type={item.icon} />
                                                        <h2>{item.title}</h2>
                                                        <div style={{color: 'red'}}>{!item.status ? '未配置' : ''}</div>
                                                    </Col>
                                                </Link>
                                        }
                                    </div>;
                                })
                            }
                        </Row>
                    </div>} />
                </Switch>
            </Title>
        );
    }
}
