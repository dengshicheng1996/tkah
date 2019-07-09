import { ActivityIndicator } from 'common/antd/mobile/activity-indicator';
import { Button } from 'common/antd/mobile/button';
import { Modal } from 'common/antd/mobile/modal';
import { Toast } from 'common/antd/mobile/toast';
import { ContactPicker, ShowNewSettingView, UploadContact } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/mobile/baseForm';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { observable, reaction, toJS, untracked } from 'mobx';
import { observer } from 'mobx-react';
import { createForm } from 'rc-form';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

@Radium
@observer
class SingleView extends React.Component<RouteComponentProps<any> & WithAppState & { form: any }, {}> {
    private disposers: Array<() => void> = [];

    @observable private systemApp: any = [];
    @observable private animating: boolean = false;
    @observable private formItem: BaseFormItem[] = [];

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getAuth();
    }

    getAuth() {
        if (this.props.data.moduleInfo.modules.length > 0) {
            const systemApp: any = [];
            this.props.data.moduleInfo.modules.forEach((r: any) => {
                if (r.type === 2 && r.fill_status !== 2) {
                    systemApp.push({
                        key: r.key,
                        id: r.id,
                        name: r.name,
                    });
                    this.getSystemInfo(r.key, r.id);
                }
            });
            this.systemApp = systemApp;

            this.getFormItem();
        }
    }

    getFormItem = () => {
        this.formItem = (this.props.data.moduleInfo.modules || []).filter((r: { type: number; html_type: string }) => r.type === 1 && r.html_type !== 'hidden').map((r: any, i: any) => {
            const item: BaseFormItem = {
                key: r.key,
                type: r.html_type,
                itemProps: { label: r.name },
                typeComponentProps: { cols: 1 },
                required: true,
                options: r.options,
                initialValue: r.html_type === 'select' ? r.value && r.value.length > 0 ? [r.value] : undefined : r.value,
            };

            if (r.html_type === 'contacts_name') {
                const index = r.key.lastIndexOf('_');
                let str = r.key;
                if (index !== -1) {
                    str = str.substring(0, index - 1);
                }

                item.typeComponentProps = _.assign({}, item.typeComponentProps, {
                    extra: (
                        <RadiumStyle scopeSelector={['.apply']}
                            rules={{
                                '.am-list-item .am-input-extra': {
                                    maxHeight: '30px',
                                },
                            }} >
                            <Button
                                size='small'
                                style={{ display: 'inline-table' }}
                                onClick={() => {
                                    this.getSystemInfo(r.html_type, {
                                        id: r.id,
                                        str,
                                        index: i,
                                    });
                                }}>通讯录选择</Button>
                        </RadiumStyle>
                    ),
                });

                item['fieldDecoratorOptions'] = {
                    rules: [
                        {
                            required: true,
                            message: `请输入${r.name}`,
                        },
                        {
                            validator: (rule: any, value: any, callback: any) => {
                                if (!value) {
                                    callback(`请输入${r.name}`);
                                    return;
                                }
                                const reg = new RegExp(regular.chinese_or_english_or_number_underline_words.reg);
                                if (!reg.test(value.replace(/\s+/g, '')) && value) {
                                    callback(`格式错误，请正确输入${r.name}（中文，英文字母和数字及下划线）`);
                                    return;
                                }
                                callback();
                            },
                        },
                    ],
                };
            }

            if (r.html_type === 'contacts_phone') {
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

    render() {

        return (
            <div>
                <RadiumStyle scopeSelector={['.apply']}
                    rules={{
                        '.am-steps-vertical .am-steps-item-description': {
                            paddingBottom: '20px',
                            color: '#666',
                        },
                    }} />
                <div className={style({
                    margin: '-40px -20px',
                })}>
                    <BaseForm form={this.props.form}
                        item={toJS(this.formItem)} />
                </div>
                <Button type='primary'
                    style={{ marginTop: '80px' }}
                    onClick={this.handleSubmit}>下一步</Button>
                <ActivityIndicator
                    toast
                    text='Loading...'
                    animating={this.animating}
                />
            </div>
        );
    }

    private contactPicker = (result: { contact: { displayName: string, iphone: string, tagLabel: string } }, obj?: { id: number, str: string, index: number }) => {
        const json: { [key: string]: any } = {};
        const modules = (this.props.data.moduleInfo.modules || []).filter((r: { type: number; html_type: string }) => r.type === 1 && r.html_type !== 'hidden');

        json[modules[obj.index].key] = result.contact.displayName;

        const key = modules[obj.index + 1].key;
        if (key.indexOf(obj.str) !== -1) {
            json[key] = result.contact.iphone.replace('-', '').replace(' ', '');
        }

        this.props.form.setFieldsValue(json);
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
            this.animating = false;
            Toast.info('通讯录为空', 3);
        }
    }

    private getSystemInfo = (key: string, obj?: any) => {
        let fn: (data?: any) => Promise<{}>;
        let callback: (data?: any, obj?: any) => void;
        let content: string;
        let toastInfo: string;

        if (key === 'phone_contacts') {
            fn = UploadContact;
            callback = this.savePhoneContacts;
            content = `没有通讯录权限，是否前去授权?`;
            toastInfo = '拒绝访问通讯录将导致无法继续认证，请在手机设置中允许访问';
        }

        if (key === 'contacts_name') {
            fn = ContactPicker;
            callback = this.contactPicker;
            content = `没有通讯录权限，是否前去授权?`;
            toastInfo = '拒绝访问通讯录将导致无法使用此功能，请在手机设置中允许访问';
        }

        if (!fn) {
            this.animating = false;
            return;
        }

        fn(this.authorization(content, toastInfo)).then((result: any) => {
            callback && callback(result, obj);
        }).catch((d) => {
            if (d) {
                Toast.info(d, 3);
            }
        });
    }

    private authorization = (content: string, toastInfo: string) => {
        return () => {
            this.animating = false;
            ShowNewSettingView({
                content,
            }).then((result: any) => {
                if (result.action === 0) {
                    Toast.info(toastInfo, 2, () => {
                        this.props.history.push('/apply/home');
                    });
                } else {
                    this.props.history.push('/apply/home');
                }
            });
        };
    }

    private handleSubmit = () => {
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

const FormCreate = createForm()(withRouter(withAppState(SingleView)));

export const Single = FormCreate;
