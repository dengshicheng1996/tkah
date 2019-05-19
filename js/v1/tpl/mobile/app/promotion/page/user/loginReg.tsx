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
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { createForm } from 'rc-form';
import * as React from 'react';
import Script from 'react-load-script';
import { RouteComponentProps, withRouter } from 'react-router-dom';

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
class LoginRegView extends React.Component<RouteComponentProps<any> & WithAuth & LoginViewProps, {}> {
    private disposers: Array<() => void> = [];
    private nc: any;
    private search: any = SearchToObject(this.props.location.search);

    private cid = parseInt(this.search.cid);
    private channelId = parseInt(this.search.channelId);
    private productId = parseInt(this.search.productId);

    @observable private data: any;
    @observable private timer: number = 0;
    @observable private loading: boolean = false;

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    getUrl() {
        const t = new Date();
        const tStr = '' + t.getFullYear() + ((t.getMonth() + 1) < 10 ? '0' + (t.getMonth() + 1) : t.getMonth() + 1) + (t.getDate() < 10 ? '0' + t.getDate() : t.getDate()) + (t.getHours() < 10 ? '0' + t.getHours() : t.getHours());

        let ali_slide_verify = `https://g.alicdn.com/sd/ncpc/nc.js?t=${tStr}`;

        if (Browser.versions().mobile) {
            ali_slide_verify = `https://g.alicdn.com/sd/nch5/index.js?t=${tStr}`;
        }
        return ali_slide_verify;
    }

    handleSubmit = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                const params = {
                    phone: values.phone.replace(/\s+/g, ''),
                    verifyCode: values.verifyCode,
                    cid: this.cid,
                    channelId: this.channelId,
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
                        '#nc_1-stage-1 .slider, #nc_1-stage-1 .slider .track, #nc_1-stage-1 .slider .button': {
                            borderRadius: '5px',
                        },
                        '.am-card': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '.am-card-body, .am-list, .am-list-body, .am-list-item': {
                            backgroundColor: 'transparent',
                        },
                        '.am-list-line::before, .am-list-line::after': {
                            display: 'none !important',
                        },
                        '.am-list-body::before, .am-list-body::after': {
                            display: 'none !important',
                        },
                        '.am-card-body::before, .am-card-body::after': {
                            display: 'none !important',
                        },
                        '.am-list-item': {
                            margin: '0 20px 20px',
                        },
                        '.am-list-item.am-input-item': {
                            borderRadius: '5px',
                            backgroundColor: '#fff',
                        },
                        '.am-input-extra': {
                            maxHeight: '30px',
                        },
                        '.verifyCode': {
                            margin: '0',
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
                <Card style={{ margin: '70% 20px 0 20px' }}>
                    <Card.Header />
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
                            <div id='sliderVerify' style={{ margin: '0 5px 20px' }}></div>
                            <div style={{ display: 'flex', margin: '0 20px 20px' }}>
                                <div style={{ flex: 1 }}>
                                    <InputItem
                                        className='verifyCode'
                                        {...getFieldProps('verifyCode', {
                                            rules: [{ required: true, message: '请输入手机验证码' }],
                                        })}
                                        clear
                                        type='text'
                                        error={!!getFieldError('verifyCode')}
                                        onErrorClick={() => {
                                            if (getFieldError('verifyCode')) {
                                                Toast.info(getFieldError('verifyCode')[0]);
                                            }
                                        }}
                                        placeholder={'请输入手机验证码'}
                                    />
                                </div>
                                <Button style={{
                                    color: '#f4513e',
                                    flex: 'initial',
                                    marginLeft: '5px',
                                    lineHeight: '44px',
                                    height: '100%',
                                    fontSize: '14px',
                                }}
                                    disabled={
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
                            </div>
                            <Button type='primary' style={{
                                margin: '10px 20px',
                                color: '#f4513e',
                                backgroundImage: 'linear-gradient(to bottom , #fdca42, #fee600)',
                            }} onClick={this.handleSubmit}>立即领钱</Button>
                        </List>
                    </Card.Body>
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
                cid: this.cid,
                phone: this.props.form.getFieldValue('phone').replace(/\s+/g, ''),
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
                    Toast.info('发送成功');
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
}

const FormCreate: typeof LoginRegView = createForm()(withRouter(withAuth(LoginRegView)));

export const LoginReg = FormCreate;
