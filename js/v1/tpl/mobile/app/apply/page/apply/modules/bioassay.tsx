import { ActivityIndicator } from 'common/antd/mobile/activity-indicator';
import { Button } from 'common/antd/mobile/button';
import { Flex } from 'common/antd/mobile/flex';
import { List } from 'common/antd/mobile/list';
import { Toast } from 'common/antd/mobile/toast';
import { FaceAuth, NavBarBack, NavBarTitle, ShowNewSettingView } from 'common/app';
import { mutate } from 'common/component/restFull';
import { ConvertBase64UrlToBlob } from 'common/fun';
import { staticBaseURL } from 'common/staticURL';
import { QiNiuUpload } from 'common/upload';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

@observer
export class BioassayView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private reminder = [
        {
            url: 'reminder_1.png',
            description: '不能戴墨镜',
        },
        {
            url: 'reminder_2.png',
            description: '不能戴帽子',
        },
        {
            url: 'reminder_3.png',
            description: '光线不能太暗',
        },
    ];

    private success: boolean;
    @observable private animating: boolean;

    @observable private imageUrl: string;

    @observable private faceLiving: { [key: string]: any };

    constructor(props: any) {
        super(props);
        NavBarBack(() => {
            this.props.history.push(`/apply/home`);
        });
        NavBarTitle('人脸对比', () => {
            this.props.data.pageTitle = '人脸对比';
        });
        this.applyFaceAuth();
    }

    render() {
        return (
            <div>
                <div className={style({
                    fontSize: '14px',
                    textAlign: 'center',
                    marginBottom: '35px',
                })}>验证时，请将镜头对准您的脸，按提示操作。</div>
                <Flex className={style({
                    marginBottom: '70px',
                })}>
                    <Flex.Item className={style({
                        textAlign: 'center',
                    })}>
                        <div>
                            <img src={staticBaseURL('reminder.png')}
                                className={style({
                                    border: '1px solid #E55800',
                                    padding: '7px',
                                    borderRadius: '50%',
                                })}
                                width='100px' height='100px' />
                        </div>
                    </Flex.Item>
                </Flex>
                <Flex>
                    {
                        this.reminder.map((r, i) => {
                            return (
                                <Flex.Item key={i} className={style({
                                    textAlign: 'center',
                                })}>
                                    <div><img src={staticBaseURL(r.url)}
                                        className={style({
                                            border: '1px solid rgba(216,216,216,1)',
                                            padding: '7px',
                                            borderRadius: '50%',
                                        })}
                                        width='72px'
                                        height='72px' /></div>
                                    <div className={style({
                                        marginTop: '10px',
                                        color: '#666666',
                                        fontSize: '14px',
                                    })}>{r.description}</div>
                                </Flex.Item>
                            );
                        })
                    }

                </Flex>
                {
                    this.success ?
                        (
                            <Button type='primary'
                                style={{ marginTop: '80px' }}
                                onClick={this.handleSubmit}>下一步</Button>
                        ) : (
                            <Button type='primary'
                                style={{ marginTop: '80px' }}
                                onClick={this.applyFaceAuth}>重新验证</Button>
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

    private uploadImage(blob: Blob, faceLiving: any) {
        QiNiuUpload(blob, {
            complete: (r) => {
                this.success = true;
                this.animating = false;
                this.imageUrl = r;
            },
            onError: (r) => {
                this.animating = false;
                Toast.info(r, 3);
            },
        });
    }

    private applyFaceAuth = () => {
        this.animating = true;
        FaceAuth({
            name: '赖玉旺',
            cardNumber: '362103198308130210',
        }, this.authorization).then((result: any) => {
            const faceLiving = JSON.parse(result.faceLiving);
            this.faceLiving = faceLiving;
            const blob = ConvertBase64UrlToBlob(faceLiving.images.image_best);
            delete faceLiving.images;
            this.uploadImage(blob, faceLiving);
        }).catch((d) => {
            this.animating = false;
            if (d) {
                Toast.info(d, 3);
            }
        });
    }

    private authorization = () => {
        ShowNewSettingView({
            content: '没有相机权限、没有读写权限，是否前去授权?',
        }).then((result: any) => {
            if (result.action === 0) {
                Toast.info('拒绝访问相机将导致无法继续认证，请在手机设置中允许访问', 2, () => {
                    this.props.history.push('/apply/home');
                });
            } else {
                this.props.history.push('/apply/home');
            }
        });
    }

    private handleSubmit = () => {
        const jsonData: any = {};
        _.forEach(toJS(this.faceLiving), (value, key) => {
            if (value.result) {
                jsonData[key] = value.result;
            }
        });
        jsonData['module_id'] = this.props.match.params.id;
        console.log(jsonData);
        if (1 === 1) {
            this.togoNext();
            return;
        }

        mutate<{}, any>({
            url: '/api/mobile/authdata',
            method: 'post',
            variables: {
                id: this.props.match.params.id,
                data: jsonData,
            },
        }).then(r => {
            this.animating = false;
            if (r.status_code === 200) {
                Toast.info('操作成功', 0.5, () => {
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

    private togoNext = () => {
        const stepInfo = this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber + 1];

        if (stepInfo) {
            this.props.history.push(`/apply/module/${stepInfo.page_type === 1 ? 'single' : 'multiple'}/${stepInfo.id}`);
        } else {
            this.props.history.push(`/apply/home`);
        }
    }

}

export const Bioassay = withRouter(withAppState(BioassayView));
