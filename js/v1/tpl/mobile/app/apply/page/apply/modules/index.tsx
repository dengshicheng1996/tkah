import { ActivityIndicator } from 'common/antd/mobile/activity-indicator';
import { Button } from 'common/antd/mobile/button';
import { Icon } from 'common/antd/mobile/icon';
import { Modal } from 'common/antd/mobile/modal';
import { Steps } from 'common/antd/mobile/steps';
import { Toast } from 'common/antd/mobile/toast';
import { NavBarBack, NavBarTitle, ShowNewSettingView, UploadContact } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate, Querier } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/mobile/baseForm';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
import * as _ from 'lodash';
import { ModuleUrls } from 'mobile/app/apply/common/publicData';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { action, observable, toJS, untracked } from 'mobx';
import { observer } from 'mobx-react';
import { createForm } from 'rc-form';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

const Step = Steps.Step;

@Radium
@observer
class ModuleView extends React.Component<RouteComponentProps<any> & WithAppState & { form: any }, {}> {
    @observable private systemApp: any = [];
    @observable private animating: boolean = false;

    constructor(props: any) {
        super(props);
        NavBarBack(() => {
            this.props.history.push(`/apply/home`);
        });
    }

    componentDidMount() {
        this.getAuth();
    }

    getAuth() {
        NavBarTitle(this.props.data.moduleInfo.title, () => {
            this.props.data.pageTitle = this.props.data.moduleInfo.title;
        });
        if (this.props.data.moduleInfo.modules.length > 0) {
            if (this.props.match.params.kind !== 'multiple') {
                this.props.data.moduleInfo.modules.forEach((r: any) => {
                    if (r.type === 2) {
                        this.systemApp.push({
                            key: r.key,
                            id: r.id,
                            name: r.name,
                        });
                        this.getSystemInfo(r.key, r.id);
                    }
                });
            }
        }
    }

    render() {
        let formItem: BaseFormItem[] = [];
        if (this.props.match.params.kind === 'single') {
            formItem = (this.props.data.moduleInfo.modules || []).filter((r: { type: number; html_type: string }) => r.type === 1 && r.html_type !== 'hidden').map((r: any, i: any) => {
                const item: BaseFormItem = {
                    key: r.key,
                    type: r.html_type,
                    itemProps: { label: r.name },
                    typeComponentProps: { cols: 1 },
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
                        '.am-steps-vertical .am-steps-item-description': {
                            paddingBottom: '20px',
                            color: '#666',
                        },
                    }} />
                {
                    this.props.match.params.kind === 'multiple' && (this.props.data.moduleInfo.modules || []).length > 1 ?
                        (
                            <Steps status='wait' current={0}>
                                {
                                    (this.props.data.moduleInfo.modules || []).map((r: any, i: number) => {
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
                            <div className={style({
                                margin: '-40px -20px',
                            })}>
                                <BaseForm form={this.props.form}
                                    item={formItem} />
                            </div>
                        ) : null
                }

                {
                    this.props.match.params.kind === 'single' ?
                        (
                            <Button type='primary'
                                style={{ marginTop: '80px' }}
                                onClick={this.handleSubmit}>下一步</Button>
                        ) : null
                }
                <ActivityIndicator
                    toast
                    text='Loading...'
                    animating={this.animating}
                />
            </div>
        );
    }

    private savePhoneContacts = (result: { contacts: any[] }, id: number) => {
        if (result.contacts && result.contacts.length > 0) {
            mutate<{}, any>({
                url: '/api/mobile/authdata/phonecontacts',
                method: 'post',
                variables: {
                    module_id: id,
                    phone_contacts: result.contacts,
                },
            }).then(r => {
                this.animating = false;
                if (r.status_code === 200) {
                    const index = _.findIndex(toJS(this.systemApp), (o: { key: string }) => o.key === 'phone_contacts');
                    if (index !== -1) {
                        this.systemApp.splice(index, 1);
                    }
                    return;
                }
                Toast.info(r.message);
            }, error => {
                this.animating = false;
                Toast.info(`Error: ${JSON.stringify(error)}`);
            });
        } else {
            Toast.info('通讯录为空', 3);
        }
    }

    private getSystemInfo = (key: string, id: number) => {
        let fn: (data?: any) => Promise<{}>;
        let callback: (data?: any, id?: number) => void;

        if (key === 'phone_contacts') {
            fn = UploadContact;
            callback = this.savePhoneContacts;
        }

        if (!fn) {
            this.animating = false;
            return;
        }

        fn(this.authorization).then((result: any) => {
            callback && callback(result, id);
        }).catch((d) => {
            if (d) {
                Toast.info(d, 3);
            }
        });
    }

    private authorization = () => {
        this.animating = false;
        ShowNewSettingView({
            content: '没有相机权限、没有读写权限，是否前去授权?',
        }).then((result: any) => {
            if (result.action === 0) {
                Toast.info('拒绝访问相机、读写将导致无法继续认证，请在手机设置中允许访问', 2, () => {
                    this.props.history.push('/apply/home');
                });
            } else {
                this.props.history.push('/apply/home');
            }
        });
    }

    private handleSubmit = () => {
        if (this.props.match.params.kind === 'single') {
            this.props.form.validateFields((err: any, values: any) => {
                if (!err) {
                    let jsonData = [];
                    jsonData = (this.props.data.moduleInfo.modules || []).map((r: any, i: any) => {
                        const item = {
                            id: r.id,
                            value: r.html_type === 'select' && values[r.key] ? values[r.key][0] : values[r.key],
                        };
                        return item;
                    });

                    mutate<{}, any>({
                        url: '/api/mobile/authdata/systemmodule',
                        method: 'post',
                        variables: {
                            id: this.props.match.params.id,
                            data: jsonData,
                        },
                    }).then(r => {
                        this.animating = false;
                        if (r.status_code === 200) {
                            Toast.info('操作成功', 0.5, () => {
                                if (this.systemApp.length > 0) {
                                    Modal.alert(
                                        '提示',
                                        `${this.props.data.moduleInfo.title}数据提交成功，${this.systemApp[0].name}上传失败，是否重新上传？`,
                                        [
                                            {
                                                text: '否',
                                                onPress: () => { this.props.history.push(`/apply/home`); },
                                            },
                                            {
                                                text: '是',
                                                onPress: () => {
                                                    this.animating = true;
                                                    this.getSystemInfo(this.systemApp[0].key, this.systemApp[0].id);
                                                },
                                            },
                                        ],
                                    );
                                    return;
                                }
                                this.togoNext();
                            });
                            return;
                        }
                        Toast.info(r.message);
                    }, error => {
                        this.animating = false;
                        Toast.info(`Error: ${JSON.stringify(error)}`);
                    });

                }
            });
        }
    }

    private togoNext = () => {
        const stepInfo = untracked(() => {
            this.props.data.stepInfo.stepNumber++;
            return this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber];
        });

        if (stepInfo) {
            this.props.history.push(`/apply/module/${stepInfo.id}/${stepInfo.page_type === 1 ? 'single' : 'multiple'}`);
        } else {
            this.props.history.push(`/apply/home`);
        }
    }
}

const FormCreate: typeof ModuleView = createForm()(withRouter(withAppState(ModuleView)));

export const Module = FormCreate;
