import { Button } from 'common/antd/button';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { Modal } from 'common/antd/modal';
import { Popconfirm } from 'common/antd/popconfirm';
import { Popover } from 'common/antd/popover';
import { Row } from 'common/antd/row';
import { Table } from 'common/antd/table';
import { Upload } from 'common/antd/upload';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
import { mutate, Querier } from 'common/restFull';
import * as _ from 'lodash';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { withAppState, WithAppState } from 'operatePlat/common/appStateStore';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

const FormItem = Form.Item;

@Radium
@observer
export class ListView extends React.Component<RouteComponentProps<any> & WithAppState & { form: any }, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private visible: boolean = false;
    @observable private loading: boolean = false;
    @observable private resultData: any;
    @observable private detailData: any;
    @observable private columns: any[];
    @observable private formColumns: any;

    @observable private domain: string;
    @observable private systemName: string;
    @observable private version: string;

    @observable private page: number = 1;
    @observable private size: number = 20;

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getList();
        this.setColumns();
        this.setFormColumns();
    }

    getList() {
        this.query.setReq({
            endpoint: '/manage/interface',
            query: 'getDomainList',
            variables: {
                domain: this.domain && this.domain.length > 0 ? this.domain : undefined,
                system_name: this.systemName && this.systemName.length > 0 ? this.systemName : undefined,
                version: this.version && this.version.length > 0 ? this.version : undefined,
                pageid: this.page - 1,
                pagesize: this.size,
            },
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return {
                domain: this.domain && this.domain.length > 0 ? this.domain : undefined,
                system_name: this.systemName && this.systemName.length > 0 ? this.systemName : undefined,
                version: this.version && this.version.length > 0 ? this.version : undefined,
                pageid: this.page - 1,
                pagesize: this.size,
            };
        }, searchData => {
            this.query.setReq({
                endpoint: '/manage/interface',
                query: 'getDomainList',
                variables: {
                    domain: this.domain && this.domain.length > 0 ? this.domain : undefined,
                    system_name: this.systemName && this.systemName.length > 0 ? this.systemName : undefined,
                    version: this.version && this.version.length > 0 ? this.version : undefined,
                    pageid: this.page - 1,
                    pagesize: this.size,
                },
            });
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    setColumns() {
        this.columns = [
            {
                title: '系统名字',
                width: '15%',
                dataIndex: 'system_name',
                render: (val: any, record: any, index: any) => {
                    return (
                        <div>
                            {val}
                            <Popover content={(
                                <div>
                                    <p>描述：{record.description}</p>
                                    <p>版本：{record.version}</p>
                                    <p>备案信息：{record.icp}</p>
                                </div>
                            )}>
                                <Icon style={{ marginLeft: '10px' }} type='info-circle' />
                            </Popover>
                        </div>
                    );
                },
            },
            {
                title: '标题',
                width: '15%',
                dataIndex: 'title',
            },
            {
                title: '域名',
                width: '15%',
                dataIndex: 'domain',
            },
            {
                title: 'logo',
                width: '10%',
                dataIndex: 'logo',
                render: (val: any, record: any, index: any) => {
                    return (
                        <Popover content={(
                            <div>
                                < img src={val} style={{ width: '300px' }} />
                            </div>
                        )}>
                            <Button type='primary' icon='eye' />
                        </Popover>
                    );
                },
            },
            {
                title: '背景图片',
                width: '10%',
                dataIndex: 'bg_img',
                render: (val: any, record: any, index: any) => {
                    return (
                        <Popover content={(
                            <div>
                                < img src={val} style={{ width: '300px' }} />
                            </div>
                        )}>
                            <Button type='primary' icon='eye' />
                        </Popover>
                    );
                },
            },
            {
                title: 'Tab logo',
                width: '10%',
                dataIndex: 'favicon',
                render: (val: any, record: any, index: any) => {
                    return (
                        <Popover content={(
                            <div>
                                < img src={val} style={{ width: '300px' }} />
                            </div>
                        )}>
                            <Button type='primary' icon='eye' />
                        </Popover>
                    );
                },
            },
            {
                title: '操作',
                width: '15%',
                key: 'action',
                dataIndex: 'action',
                render: (text: any, record: any, index: any) => (
                    <div>
                        <span>
                            <a href='javascript:;' onClick={() => {
                                this.detailData = record;
                                this.visible = true;
                            }} >修改 </a>|
                        <Popconfirm title='确认删除?' onConfirm={() => {
                                this.optionInfo('delDomain', { id: record.id });
                            }}>
                                <a href='javascript:;'>  删除</a>
                            </Popconfirm>
                        </span>
                    </div>
                ),
            },
        ];
    }

    setFormColumns() {
        this.formColumns = [
            {
                title: '系统名字',
                required: false,
                dataIndex: 'system_name',
            },
            {
                title: '域名',
                required: false,
                dataIndex: 'domain',
            },
            {
                title: '标题',
                required: false,
                dataIndex: 'title',
            },
            {
                title: '描述',
                required: false,
                dataIndex: 'description',
            },
            {
                title: '版本',
                required: false,
                dataIndex: 'version',
                validator: (rule: any, value: any, callback: any) => {
                    const reg = new RegExp(regular.english_words.reg);
                    if (!reg.test(value) && value) {
                        callback('格式错误，请输入字母');
                        return;
                    }
                    callback();
                },
            },
            {
                title: '备案信息',
                required: false,
                dataIndex: 'icp',
            },
            {
                title: 'logo',
                required: false,
                dataIndex: 'logo',
                type: 'upload',
            },
            {
                title: '背景图片',
                required: false,
                dataIndex: 'bg_img',
                type: 'upload',
            },
            {
                title: 'Tab logo',
                required: false,
                dataIndex: 'favicon',
                type: 'upload',
            },
        ];
    }

    render() {
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };

        const { getFieldDecorator } = this.props.form;

        const dataSource = (_.get(toJS(this.resultData), 'list') as any[] || []).map((r, i) => {
            r['key'] = i;
            return r;
        });

        const dataFormColumns = toJS(this.formColumns);

        return (
            <div style={{ background: '#fff', padding: 24 }}>
                <Row gutter={20} style={{ marginBottom: '20px' }}>
                    <Col span={8}>
                        <Input.Search
                            placeholder='输入域名'
                            onSearch={value => this.domain = value}
                        />
                    </Col>
                    <Col span={8}>
                        <Input.Search
                            placeholder='输入系统名'
                            onSearch={value => this.systemName = value}
                        />
                    </Col>
                    <Col span={8}>
                        <Input.Search
                            placeholder='输入版本'
                            onSearch={value => this.version = value}
                        />
                    </Col>
                </Row>

                <Button type='primary'
                    style={{ marginBottom: '15px' }}
                    onClick={() => {
                        this.detailData = undefined;
                        this.visible = true;
                    }} >添加</Button>

                <Table columns={toJS(this.columns)}
                    loading={this.loading}
                    pagination={{
                        current: this.page,
                        total: (_.get(toJS(this.resultData), 'count') as number || 0),
                        defaultPageSize: this.size,
                        onChange: (page, pageSize) => {
                            this.page = page;
                            this.size = pageSize;
                        },
                    }}
                    dataSource={dataSource} />

                <Modal
                    visible={this.visible}
                    title='域名解析详情'
                    onOk={this.handleOk}
                    onCancel={this.showModal}
                    destroyOnClose={true}
                >
                    <Form>
                        {
                            (dataFormColumns || []).map((comment: any, index: number) => (

                                <FormItem
                                    key={index}
                                    {...formItemLayout}
                                    label={(
                                        <span>{comment.title}</span>
                                    )}
                                >
                                    {
                                        comment.type === 'upload' ?
                                            getFieldDecorator(comment.dataIndex, {
                                                valuePropName: 'fileList',
                                                getValueFromEvent: this.normFile,
                                                rules: [{ required: comment.required, message: '请上传背景图' }],
                                                initialValue: this.detailData && this.detailData[comment.dataIndex] ? this.initFileList(this.detailData[comment.dataIndex]) : undefined,
                                            })(
                                                <Upload action='/uploadAny' multiple={false} listType='picture'>
                                                    <Button>
                                                        <Icon type='upload' /> 点击上传
                                                </Button>
                                                </Upload>,
                                            ) :
                                            getFieldDecorator(comment.dataIndex, {
                                                rules: [
                                                    { required: comment.required, message: `请输入${comment.title}！`, whitespace: true },
                                                    {
                                                        validator: comment.validator,
                                                    },
                                                ],
                                                initialValue: this.detailData && this.detailData[comment.dataIndex] ? this.detailData[comment.dataIndex] : undefined,
                                            })(
                                                <Input />,
                                            )
                                    }
                                </FormItem>
                            ))
                        }
                    </Form>
                </Modal>

            </div>
        );
    }

    private initFileList = (Url: any) => {
        if (Url) {
            const name = Url.substr(Url.lastIndexOf('/') + 1);
            return [{
                uid: -1,
                name,
                status: 'done',
                url: Url,
                init: true,
            }];
        } else {
            return [];
        }
    }

    private normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    }

    private handleOk = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                const logo = values.logo && values.logo.length > 0 ? values.logo[values.logo.length - 1].response ?
                    values.logo[values.logo.length - 1].response.url : values.logo[values.logo.length - 1].url : '1';
                const bg_img = values.bg_img && values.bg_img.length > 0 ? values.bg_img[values.bg_img.length - 1].response ?
                    values.bg_img[values.bg_img.length - 1].response.url : values.bg_img[values.bg_img.length - 1].url : '1';
                const favicon = values.favicon && values.favicon.length > 0 ? values.favicon[values.favicon.length - 1].response ?
                    values.favicon[values.favicon.length - 1].response.url : values.favicon[values.favicon.length - 1].url : '1';

                const data = Object.assign({}, values, { logo, bg_img, favicon });

                this.optionInfo('editDomainInfo', Object.assign({}, this.detailData, data));
            }
        });
    }

    private showModal = () => {
        this.visible = !this.visible;
    }

    private optionInfo = (queryType: string, data: any) => {
        mutate({
            endpoint: '/manage/interface',
            query: queryType,
            variables: data,
        }).then((r) => {
            this.detailData = undefined;
            this.props.form.resetFields();
            this.query.refresh();
            if (queryType !== 'delDomain') {
                this.showModal();
            }
        });
    }
}

const FormCreate = Form.create()(withRouter(withAppState(ListView)));
export const List = FormCreate;
