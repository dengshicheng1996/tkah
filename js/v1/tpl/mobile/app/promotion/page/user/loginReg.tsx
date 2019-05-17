import { Button } from 'common/antd/mobile/button';
import { Card } from 'common/antd/mobile/card';
import { InputItem } from 'common/antd/mobile/input-item';
import { List } from 'common/antd/mobile/list';
import { Toast } from 'common/antd/mobile/toast';
import { WithAuth, withAuth } from 'common/component/auth';
import { RadiumStyle } from 'common/component/radium_style';
import { SearchToObject } from 'common/fun';
import { noCaptchaObj } from 'common/noCaptcha';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
import { Browser } from 'common/sys';
import * as _ from 'lodash';
import { WithAppState, withAppState } from 'mobile/common/appStateStore';
import { computed, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { createForm } from 'rc-form';
import * as React from 'react';
import Script from 'react-load-script';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

const LoadScript: any = Script;

interface LoginViewProps {
    form?: any;
    param: any;
    match: {
        params: {
            kind: string;
        };
    };
    location: {
        search: string;
    };
}

@Radium
@observer
class LoginRegView extends React.Component<RouteComponentProps<any> & WithAuth & LoginViewProps & WithAppState, {}> {
    private disposers: Array<() => void> = [];
    private nc: any;
    private search: any = SearchToObject(this.props.location.search);
    @observable private data: any;
    @observable private timer: number = 0;
    @observable private loading: boolean = false;

    @computed get modalKind(): string {
        return this.props.match.params.kind;
    }

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.props.data.appState.currentUser.cid = this.search.cid ? parseInt(this.search.cid) : this.props.data.appState.currentUser.cid;
        this.props.data.appState.currentUser.channelId = this.search.channelId ? parseInt(this.search.channelId) : this.props.data.appState.currentUser.channelId;
        this.props.data.appState.currentUser.productId = this.search.productId ? parseInt(this.search.productId) : this.props.data.appState.currentUser.productId;

        this.disposers.push(reaction(() => {
            return {
                modalKind: this.modalKind,
            };
        }, searchData => {
            this.resetVerifySlider();
            this.props.form.setFieldsValue({
                verifyCode: undefined,
            });
        }));

    }

    getUrl() {
        const t = new Date();
        const tStr = '' + t.getFullYear() + ((t.getMonth() + 1) < 10 ? '0' + (t.getMonth() + 1) : t.getMonth() + 1) + (t.getDate() < 10 ? '0' + t.getDate() : t.getDate()) + (t.getHours() < 10 ? '0' + t.getHours() : t.getHours());

        let ali_slide_verify = `https://g.alicdn.com/sd/ncpc/nc.js?t=${tStr}`;

        if (Browser.versions().mobile) {
            ali_slide_verify = `//g.alicdn.com/sd/nch5/index.js?t=${tStr}`;
        }
        return ali_slide_verify;
    }

    handleSubmit = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                const params = {
                    phone: values.phone.replace(/\s+/g, ''),
                    verifyCode: values.verifyCode,
                    cid: this.props.data.appState.currentUser.cid,
                    channelId: this.props.data.appState.currentUser.channelId,
                };

                this.props.auth.login(params).then((r: any) => {
                    if (r.kind === 'result') {
                        if (r.result.status !== 'user') {
                            Toast.info(r.result.msg);
                        }
                        return;
                    }
                    Toast.info(r.error);
                });
            }
        });
    }

    render() {
        const status = toJS(this.props.auth.status);
        if (status.state === 'user') {
            this.props.history.push(this.search.next ? this.search.next : `/apply/home${this.props.location.search}`);
        }

        const { getFieldProps, getFieldError } = this.props.form;

        return (
            <div className='slider-verify'>
                <RadiumStyle scopeSelector={['.promotion']}
                    rules={{
                        '.slider-verify .nc_iconfont': {
                            webkitBoxSizing: 'content-box',
                            mozBoxSizing: 'content-box',
                            boxSizing: 'content-box',
                        },
                        '.slider-verify .nc_iconfont .stage1 .slider': {
                            height: '52px',
                            borderRadius: '0.063rem',
                            backgroundColor: '#EBF0F6',
                        },
                        '.slider-verify .nc_iconfont .stage1 .track div': {
                            borderRadius: '0.063rem',
                            color: '#fff',
                        },
                        '.slider-verify .nc_iconfont .stage1 .bg-green': {
                            backgroundColor: '#78c430',
                        },
                        '.slider-verify .nc_iconfont .stage1 .bg-red': {
                            backgroundColor: '#ff5500',
                        },
                        '.verifyCode .am-input-extra': {
                            maxHeight: 'none',
                        },
                        '.am-list-body::before, .am-list-body::after': {
                            height: '0px !important',
                        },
                    }} />
                {
                    !this.nc ?
                        (
                            <LoadScript
                                url={this.getUrl()}
                                onError={() => {
                                    console.log('加载阿里滑动验证失败');
                                }}
                                onLoad={() => {
                                    const appkey = 'FFFF0N00000000000C88';
                                    const nc_token = [appkey, (new Date()).getTime(), Math.random()].join(':');

                                    this.nc = noCaptchaObj({
                                        nc_token,
                                        NC_Opt: {
                                            appkey,
                                            callback: (data: any, scene: any) => {
                                                this.data = {
                                                    aliSessionId: data.csessionid,
                                                    aliToken: nc_token,
                                                    aliSig: data.sig,
                                                    aliScene: scene,
                                                };
                                            },
                                        },
                                    });
                                }}
                            />
                        ) : null
                }
                <Card style={{ margin: '20px' }}>
                    <Card.Header
                        title={(
                            <div style={{ color: '#E46322', textAlign: 'center', width: '100%' }}>{this.modalKind === 'login' ? '登录账户' : '注册账户'}</div>
                        )} />
                    <Card.Body style={{ padding: '0px 1px' }}>
                        <List>
                            <InputItem
                                {...getFieldProps('phone', {
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
                                })}
                                clear
                                type='phone'
                                error={!!getFieldError('phone')}
                                onErrorClick={() => {
                                    if (getFieldError('phone')) {
                                        Toast.info(getFieldError('phone')[0]);
                                    }
                                }}
                                placeholder={'请输入手机号'}
                            />
                            <List.Item>
                                <div id='sliderVerify' style={{ margin: '0 -13px' }}></div>
                            </List.Item>
                            <InputItem
                                className='verifyCode'
                                {...getFieldProps('verifyCode', {
                                    rules: [{ required: true, message: '请输入手机验证码' }],
                                })}
                                clear
                                type='text'
                                extra={(
                                    <Button disabled={
                                        this.timer !== 0 ||
                                        !this.props.form.getFieldValue('phone') ||
                                        !!getFieldError('phone') ||
                                        !toJS(this.data)
                                    }
                                        type='primary' size='small' inline
                                        onClick={() => {
                                            if (this.timer <= 0) {
                                                this.reSendCode(true);
                                            } else {
                                                this.reSendCode(false);
                                            }
                                        }}>{this.timer === 0 || this.timer > 59 ? '发送验证码' : `${this.timer}s`}</Button>
                                )}
                                error={!!getFieldError('verifyCode')}
                                onErrorClick={() => {
                                    if (getFieldError('verifyCode')) {
                                        Toast.info(getFieldError('verifyCode')[0]);
                                    }
                                }}
                                placeholder={'请输入手机验证码'}
                            />
                            <List.Item>
                                <Button type='primary' style={{ margin: '10px 0' }} onClick={this.handleSubmit}>登录</Button>
                            </List.Item>
                        </List>
                    </Card.Body>
                    <Card.Footer content={(
                        <div style={{ textAlign: 'right' }}>
                            {this.modalKind === 'login' ? '没有账号？' : '有账号？'}
                            <Link
                                to={`/saas/user/${this.modalKind === 'login' ? 'register' : 'login'}${this.props.location.search}`}>
                                {this.modalKind === 'login' ? '立即注册' : '立即登录'}
                            </Link>
                        </div>
                    )} />
                </Card>
            </div>
        );
    }

    private resetVerifySlider = () => {
        if (this.nc) {
            if (this.nc.reload) {
                this.nc.reload(); // 重置阿里验证
            } else {
                this.nc.reset();
            }
        }
        this.data = undefined;
    }

    private reSendCode = (reTimer: boolean) => {
        if (reTimer) {
            const values = {
                cid: this.props.data.appState.currentUser.cid,
                phone: this.props.form.getFieldValue('phone').replace(/\s+/g, ''),
                kind: this.modalKind,
            };

            if (!toJS(this.data)) {
                Toast.info('请先通过滑动验证');
                return;
            } else {
                this.timer = 61;
                _.assign(values, toJS(this.data));

                this.props.auth.sendCode(values).then((r: any) => {
                    if (r.kind !== 'result') {
                        Toast.info(r.error);
                        return;
                    }
                    let msg: string = '发送成功';
                    let callback;
                    if (r.result.status !== 1) {
                        // code 3001 开始获取语音验证码
                        if (parseInt(r.result.code) === 3001) {
                            msg = r.result.msg;
                            callback = () => {
                                this.sendVoiceVerify(values);
                            };
                        } else if (parseInt(r.result.code) === 1017) {
                            msg = this.modalKind === 'register' ? '该手机号已注册，点击确定后将跳转到登录页面' : '该手机号未注册，点击确定后将跳转到注册页面';
                            callback = this.resetVerifySlider;
                        } else {
                            msg = r.result.msg;
                            callback = this.resetVerifySlider;
                        }
                    }
                    Toast.info(msg, 3, callback);
                });
            }
        }
        if (this.timer > 0) {
            this.timer -= 1;
            setTimeout(() => {
                this.reSendCode(false);
            }, 1000);
        }
        if (this.timer === 0) {
            this.resetVerifySlider();
        }
    }

    private sendVoiceVerify = (values: any) => {
        this.props.auth.sendCode(Object.assign({}, values, { voiceCode: true })).then((r: any) => {
            if (r.kind !== 'result') {
                Toast.info(r.error);
                return;
            }
        });

    }
}

const FormCreate: typeof LoginRegView = createForm()(withRouter(withAuth(withAppState(LoginRegView))));

export const LoginReg = FormCreate;
