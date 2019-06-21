import { ActivityIndicator } from 'common/antd/mobile/activity-indicator';
import { Button } from 'common/antd/mobile/button';
import { Flex } from 'common/antd/mobile/flex';
import { InputItem } from 'common/antd/mobile/input-item';
import { List } from 'common/antd/mobile/list';
import { Modal } from 'common/antd/mobile/modal';
import { Toast } from 'common/antd/mobile/toast';
import { FaceOCR, NavBarBack, NavBarTitle, ShowNewSettingView } from 'common/app';
import { mutate } from 'common/component/restFull';
import { ConvertBase64UrlToBlob } from 'common/fun';
import { staticImgURL } from 'common/staticURL';
import { Browser } from 'common/sys';
import { QiNiuUpload } from 'common/upload';
import * as _ from 'lodash';
import { ModuleUrls } from 'mobile/app/apply/common/publicData';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { computed, observable, toJS, untracked } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

@observer
export class OcrView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    @observable private isFront: number = 1;

    @observable private name: string;
    @observable private cardNumber: string;
    @observable private cardPositive: string;
    @observable private cardNegative: string;
    @observable private animating: boolean;
    @observable private faceOCR: { [key: string]: any };

    constructor(props: any) {
        super(props);
        NavBarBack(() => {
            this.animating = false;
            Modal.alert('提示', '您的资料认证未完成，请确认是否退出？', [
                { text: '取消' },
                {
                    text: '确定', onPress: () => {
                        this.props.history.push(`/apply/home`);
                    },
                },
            ]);
        });
        NavBarTitle('身份证OCR', () => {
            this.props.data.pageTitle = '身份证OCR';
        });
        this.applyFaceOCR();
    }

    render() {
        return (
            <div>
                {
                    this.isFront === 3 ?
                        (
                            <List className={style({
                                margin: '-40px -20px 30px',
                            })}>
                                <InputItem editable={false} value={this.name}>姓名</InputItem>
                                <InputItem editable={false} value={this.cardNumber}>身份证</InputItem>
                            </List>
                        ) : null
                }
                <Flex className={style({
                    marginBottom: '30px',
                })}>
                    <Flex.Item className={style({
                        textAlign: 'center',
                    })}>
                        <div>
                            <img src={this.cardPositive ? this.cardPositive : staticImgURL('identity.png')}
                                onError={(e: any) => {
                                    console.log(e);
                                    console.log(e.target.src);
                                }}
                                className={style({
                                    border: '1px solid #E55800',
                                })}
                                width='240px' height='150px' />
                        </div>
                    </Flex.Item>
                </Flex>
                <Flex className={style({
                    marginBottom: '30px',
                })}>
                    <Flex.Item className={style({
                        textAlign: 'center',
                    })}>
                        <div>
                            <img src={this.cardNegative ? this.cardNegative : staticImgURL('identity2.png')}
                                onError={(e: any) => {
                                    console.log(e);
                                    console.log(e.target.src);
                                }}
                                className={style({
                                    border: '1px solid #E55800',
                                })}
                                width='240px' height='150px' />
                        </div>
                    </Flex.Item>
                </Flex>
                {
                    this.isFront === 3 ?
                        (
                            <Button type='primary'
                                style={{ marginTop: '80px' }}
                                onClick={this.handleSubmit}>下一步</Button>
                        ) : (
                            <Button type='primary'
                                style={{ marginTop: '80px' }}
                                onClick={this.applyFaceOCR}>重新拍摄</Button>
                        )
                }
                <ActivityIndicator
                    toast
                    text='Loading...'
                    animating={this.animating}
                />
            </div>
        );
    }

    private uploadImage(blob: Blob) {
        QiNiuUpload(blob, {
            complete: (r) => {
                this.animating = false;
                if (this.isFront === 1) {
                    this.cardPositive = r;
                    this.isFront = 2;
                    this.applyFaceOCR();
                } else if (this.isFront === 2) {
                    this.cardNegative = r;
                    this.isFront = 3;
                } else if (this.isFront === 3) {
                    this.cardPositive = r;
                }
            },
            onError: (r) => {
                this.animating = false;
                console.log(r);
            },
        });
    }

    private applyFaceOCR = () => {
        this.animating = true;

        FaceOCR({
            isFront: this.isFront === 3 ? 1 : this.isFront,
        }, this.authorization).then((result: any) => {
            const faceOCR = JSON.parse(result.faceOCR);
            if (this.isFront === 1) {
                this.faceOCR = faceOCR;
            }

            if (faceOCR.name) {
                this.name = faceOCR.name.result;
            }
            if (faceOCR.idcard_number) {
                this.cardNumber = faceOCR.idcard_number.result;
            }
            const blob = ConvertBase64UrlToBlob(result.cardImg);
            this.uploadImage(blob);
        }).catch((d) => {
            this.animating = false;
            if (d) {
                Toast.info(d, 3);
            }
        });
    }

    private authorization = () => {
        this.animating = false;
        let content = '没有相机权限、没有读写权限，是否前去授权?';
        let toastInfo = '拒绝访问相机、读写将导致无法继续认证，请在手机设置中允许访问';
        if (Browser.versions().ios) {
            content = '没有相机权限，是否前去授权?';
            toastInfo = '拒绝访问相机将导致无法继续认证，请在手机设置中允许访问';
        }
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
    }

    private handleSubmit = () => {
        this.animating = true;
        const jsonData: any = {};
        _.forEach(toJS(this.faceOCR), (value, key) => {
            if (value.result) {
                jsonData[key] = value.result;
            }
        });
        const { modules, moduleNumber } = this.props.data.moduleInfo;

        jsonData['module_id'] = modules[moduleNumber].id;
        jsonData['idcard_front_picture'] = this.cardPositive;
        jsonData['idcard_reverse_picture'] = this.cardNegative;

        mutate<{}, any>({
            url: '/api/mobile/authdata/idcard',
            method: 'post',
            variables: jsonData,
        }).then(r => {
            this.animating = false;
            if (r.status_code === 200) {
                Toast.info('操作成功', 0.5, () => {
                    this.togoNext();
                });

                return;
            }
            Modal.alert('提示', r.message, [
                { text: '取消' },
                {
                    text: '重新拍摄', onPress: () => {
                        this.isFront = 1;
                        this.applyFaceOCR();
                    },
                },
            ]);
        }, error => {
            this.animating = false;
            Toast.info(`Error: ${JSON.stringify(error)}`);
        });
    }

    private togoNext = () => {
        const { modules, moduleNumber } = this.props.data.moduleInfo;
        if (moduleNumber === modules.length - 1) {
            const stepInfo = untracked(() => {
                this.props.data.stepInfo.stepNumber++;
                return this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber];
            });

            if (stepInfo) {
                this.props.history.push(`/apply/module/${stepInfo.id}/${stepInfo.page_type === 1 ? 'single' : 'multiple'}`);
            } else {
                this.props.history.push(`/apply/home`);
            }
        } else {
            this.props.data.moduleInfo.moduleNumber++;
            this.props.history.push(ModuleUrls(this.props.data.moduleInfo.modules[this.props.data.moduleInfo.moduleNumber].key, this.props.match.params.id, this.props.match.params.kind));
        }
    }

}

export const Ocr = withRouter(withAppState(OcrView));
