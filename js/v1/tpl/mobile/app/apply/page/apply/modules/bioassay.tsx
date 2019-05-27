import { ActivityIndicator } from 'common/antd/mobile/activity-indicator';
import { Button } from 'common/antd/mobile/button';
import { Flex } from 'common/antd/mobile/flex';
import { Toast } from 'common/antd/mobile/toast';
import { FaceAuth, NavBarBack, NavBarTitle, ShowNewSettingView } from 'common/app';
import { mutate, Querier } from 'common/component/restFull';
import { ConvertBase64UrlToBlob } from 'common/fun';
import { staticBaseURL } from 'common/staticURL';
import { QiNiuUpload } from 'common/upload';
import * as _ from 'lodash';
import { ModuleUrls } from 'mobile/app/apply/common/publicData';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

@observer
export class BioassayView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];
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

    @observable private resultData: any = {};
    @observable private loading: boolean = false;
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
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getIdcard();
    }

    getIdcard() {
        this.animating = true;
        this.query.setReq({
            url: `/api/mobile/authdata/idcard`,
            method: 'get',
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || {};
        }, searchData => {
            this.resultData = searchData;
            this.applyFaceAuth();
        }));
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
        FaceAuth({
            name: this.resultData.name,
            cardNumber: this.resultData.idcard_number,
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
        mutate<{}, any>({
            url: '/api/mobile/authdata/facecontrast',
            method: 'post',
            variables: {
                module_id: this.props.location.state.module_id,
                face_living: this.faceLiving,
                image_urls: this.imageUrl,
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
        const { steps, stepNumber } = this.props.location.state;
        if (stepNumber === steps.length - 1) {
            const stepInfo = this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber + 1];
            if (stepInfo) {
                this.props.history.push(`/apply/module/${stepInfo.page_type === 1 ? 'single' : 'multiple'}/${stepInfo.id}`);
            } else {
                this.props.history.push(`/apply/home`);
            }
        } else {
            const info = steps[stepNumber + 1];

            this.props.history.push({
                pathname: ModuleUrls[info.key],
                state: {
                    steps: toJS(steps),
                    stepNumber: stepNumber + 1,
                },
            });
        }
    }

}

export const Bioassay = withRouter(withAppState(BioassayView));
