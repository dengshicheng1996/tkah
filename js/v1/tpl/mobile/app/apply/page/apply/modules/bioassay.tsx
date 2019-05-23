import { Button } from 'common/antd/mobile/button';
import { Flex } from 'common/antd/mobile/flex';
import { List } from 'common/antd/mobile/list';
import { Toast } from 'common/antd/mobile/toast';
import { FaceAuth, NavBarBack, NavBarTitle } from 'common/app';
import { ConvertBase64UrlToBlob } from 'common/fun';
import { staticBaseURL } from 'common/staticURL';
import { QiNiuUpload } from 'common/upload';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

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
                    <Button type='primary'
                        style={{ marginTop: '80px' }}
                        onClick={this.handleSubmit}>下一步</Button>
                    <div className={style({
                        fontSize: '14px',
                        textAlign: 'center',
                        margin: '15px',
                    })}>若信息有误，请<span className={style({ color: '#E55800' })} onClick={this.applyFaceAuth}>重新拍摄</span></div>
                </Flex>
            </div>
        );
    }

    private uploadImage(blob: Blob, faceLiving: any) {
        Toast.info('数据上传中', 0.5);

        // const formData = new FormData();
        // formData.append('file', blob);

        QiNiuUpload(blob, {
            complete: (r) => {
                console.log(r);
            },
            onError: (r) => {
                console.log(r);
            },
        });
    }

    private applyFaceAuth = () => {
        FaceAuth({
            name: '潘凯',
            cardNumber: '429004199111200412',
        }).then((result: any) => {
            const faceLiving = JSON.parse(result.faceLiving);
            const blob = ConvertBase64UrlToBlob(faceLiving.images.image_best);
            delete faceLiving.images;
            this.uploadImage(blob, faceLiving);
        }).catch((d) => {
            if (d) {
                Toast.info(d, 3);
            }
        });
    }

    private handleSubmit = () => {
        const stepInfo = this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber + 1];

        if (stepInfo) {
            this.props.history.push(`/apply/module/${stepInfo.page_type === 1 ? 'single' : 'multiple'}/${stepInfo.id}`);
        } else {
            this.props.history.push(`/apply/home`);
        }
    }

}

export const Bioassay = withRouter(withAppState(BioassayView));
