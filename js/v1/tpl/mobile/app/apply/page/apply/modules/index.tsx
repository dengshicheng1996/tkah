import { Button } from 'common/antd/mobile/button';
import { Icon } from 'common/antd/mobile/icon';
import { Steps } from 'common/antd/mobile/steps';
import { Toast } from 'common/antd/mobile/toast';
import { NavBarBack, NavBarTitle, UploadContact } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate, Querier } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/mobile/baseForm';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
import * as _ from 'lodash';
import { ModuleUrls } from 'mobile/app/apply/common/publicData';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { string } from 'prop-types';
import { createForm } from 'rc-form';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

const Step = Steps.Step;

@Radium
@observer
class ModuleView extends React.Component<RouteComponentProps<any> & WithAppState & { form: any }, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private loading: boolean = false;
    @observable private resultData: any = [];

    constructor(props: any) {
        super(props);
        NavBarBack(() => {
            this.props.history.push(`/apply/home`);
        });
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getAuth();
    }

    getAuth() {
        this.query.setReq({
            url: `/api/mobile/authdata/${this.props.match.params.id}`,
            method: 'get',
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || { title: '', list: [] };
        }, searchData => {
            NavBarTitle(searchData.title, () => {
                this.props.data.pageTitle = searchData.title;
            });
            this.resultData = searchData.list;
            if (searchData.list.length > 0) {
                if (this.props.match.params.kind === 'multiple') {
                    if (!(this.props.location.state && this.props.location.state.unauto)) {
                        this.gotoURL(searchData.list);
                    }
                } else {
                    searchData.list.forEach((r: any) => {
                        if (r.key === 'phone_contacts') {
                            this.getContact(r.id);
                        }
                    });
                }
            }
        }));
    }

    gotoURL(steps: any) {
        let stepNumber = 0;

        steps.forEach((r: { status: number; }, i: number) => {
            if (r.status === 2) {
                stepNumber = i;
            }
        });

        this.props.history.push({
            pathname: ModuleUrls[steps[stepNumber].key],
            state: {
                steps: toJS(steps),
                stepNumber,
            },
        });
    }

    render() {
        let formItem = [];
        if (this.props.match.params.kind === 'single') {
            formItem = (this.resultData || []).filter((r: { type: number; html_type: string }) => r.type === 1 && r.html_type !== 'hidden').map((r: any, i: any) => {
                const item: BaseFormItem = {
                    key: r.key,
                    type: r.html_type,
                    itemProps: { label: r.name },
                    required: true,
                    options: r.options,
                    initialValue: r.html_type === 'select' ? [r.value] : r.value,
                };

                if (r.html_type === 'inputPhone') {
                    item['fieldDecoratorOptions'] = {
                        rules: [
                            {
                                required: true,
                                message: '请输入手机号',
                            },
                            {
                                validator: (rule: any, value: any, callback: any) => {
                                    if (!value) {
                                        callback('请输入手机号');
                                        return;
                                    }
                                    const reg = new RegExp(regular.phone_number.reg);
                                    if (!reg.test(value.replace(/\s+/g, '')) && value) {
                                        callback('格式错误，请正确输入手机号');
                                        return;
                                    }
                                    callback();
                                },
                            },
                        ],
                    };
                }
                return item;
            });
        }

        return (
            <div>
                <RadiumStyle scopeSelector={['.apply']}
                    rules={{
                        '.am-list-body .am-list-item.am-list-item-middle': {
                            paddingLeft: '0',
                        },
                        '.am-steps-vertical .am-steps-item-description': {
                            paddingBottom: '20px',
                            color: '#666',
                        },
                    }} />
                {
                    this.props.match.params.kind === 'multiple' && (this.resultData || []).length > 1 ?
                        (
                            <Steps status='wait' current={0}>
                                {
                                    (this.resultData || []).map((r: any, i: number) => {
                                        return (
                                            <Step key={i} status={r.status}
                                                title={r.name}
                                                icon={<Icon type='check-circle' />}
                                                description={r.docs} />
                                        );
                                    })
                                }
                            </Steps>
                        ) : this.props.match.params.kind === 'single' ? (
                            <div>
                                <BaseForm form={this.props.form}
                                    item={formItem} />
                            </div>
                        ) : null
                }

                {
                    (this.props.location.state && this.props.location.state.unauto) || this.props.match.params.kind === 'single' ?
                        (
                            <Button type='primary'
                                style={{ marginTop: '80px' }}
                                onClick={this.handleSubmit}>下一步</Button>
                        ) : null
                }
            </div>
        );
    }

    private savePhoneContacts = (id, phone_contacts) => {
        mutate<{}, any>({
            url: '/api/mobile/authdata/phonecontacts',
            method: 'post',
            variables: {
                module_id: id,
                phone_contacts,
            },
        }).then(r => {
            this.loading = false;
            if (r.status_code === 200) {
                Toast.info('操作成功', 0.5, () => {
                    this.togoNext();
                });

                return;
            }
            Toast.info(r.message);
        }, error => {
            this.loading = false;
            Toast.info(`Error: ${JSON.stringify(error)}`);
        });
    }

    private getContact = (id) => {
        UploadContact().then((result: any) => {
            if (result.contacts && result.contacts.length > 0) {
                this.savePhoneContacts(id, result.contacts);
            } else {
                Toast.info('通讯录为空', 3);
            }
        }).catch((d) => {
            if (d) {
                Toast.info(d, 3);
            }
        });
    }

    private handleSubmit = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                let jsonData = [];
                if (this.props.match.params.kind === 'single') {
                    jsonData = (this.resultData || []).map((r: any, i: any) => {
                        const item = {
                            id: r.id,
                            value: r.html_type === 'select' && values[r.key] ? values[r.key][0] : values[r.key],
                        };
                        return item;
                    });
                }

                mutate<{}, any>({
                    url: '/api/mobile/authdata',
                    method: 'post',
                    variables: {
                        id: this.props.match.params.id,
                        data: jsonData,
                    },
                }).then(r => {
                    this.loading = false;
                    if (r.status_code === 200) {
                        Toast.info('操作成功', 0.5, () => {
                            this.togoNext();
                        });

                        return;
                    }
                    Toast.info(r.message);
                }, error => {
                    this.loading = false;
                    Toast.info(`Error: ${JSON.stringify(error)}`);
                });

            }
        });
    }

    private togoNext = () => {
        const stepInfo = this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber + 1];

        if (stepInfo) {
            this.props.history.push(`/apply/module/${stepInfo.page_type === 1 ? 'single' : 'multiple'}/${stepInfo.id}`);
        } else {
            this.props.history.push(`/apply/home`);
        }
    }
}

const FormCreate: typeof ModuleView = createForm()(withRouter(withAppState(ModuleView)));

export const Module = FormCreate;
