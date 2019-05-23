import { Button } from 'common/antd/mobile/button';
import { Flex } from 'common/antd/mobile/flex';
import { List } from 'common/antd/mobile/list';
import { Toast } from 'common/antd/mobile/toast';
import { FaceOCR, NavBarBack, NavBarTitle } from 'common/app';
import { ConvertBase64UrlToBlob } from 'common/fun';
import { staticBaseURL } from 'common/staticURL';
import { QiNiuUpload } from 'common/upload';
import * as _ from 'lodash';
import { ModuleUrls } from 'mobile/app/apply/common/publicData';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

@observer
export class OcrView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private isFront: number = 1;

    @observable private name: string;
    @observable private cardNumber: string;

    @observable private cardPositive: string;
    @observable private cardNegative: string;

    constructor(props: any) {
        super(props);
        NavBarBack(() => {
            this.props.history.push(`/apply/home`);
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
                    this.isFront === 2 ?
                        (
                            <List className={style({
                                marginBottom: '70px',
                            })}>
                                <List.Item extra={this.name}>姓名</List.Item>
                                <List.Item extra={this.cardNumber}>身份证</List.Item>
                            </List>
                        ) : null
                }
                <Flex className={style({
                    marginBottom: '70px',
                })}>
                    <Flex.Item className={style({
                        textAlign: 'center',
                    })}>
                        <div>
                            <img src={this.cardPositive}
                                className={style({
                                    border: '1px solid #E55800',
                                })}
                                width='150px' height='150px' />
                        </div>
                    </Flex.Item>
                </Flex>
                <Flex className={style({
                    marginBottom: '70px',
                })}>
                    <Flex.Item className={style({
                        textAlign: 'center',
                    })}>
                        <div>
                            <img src={this.cardNegative}
                                className={style({
                                    border: '1px solid #E55800',
                                })}
                                width='150px' height='150px' />
                        </div>
                    </Flex.Item>
                </Flex>
                <Button type='primary'
                    style={{ marginTop: '80px' }}
                    onClick={this.handleSubmit}>下一步</Button>
                <div className={style({
                    fontSize: '14px',
                    textAlign: 'center',
                    margin: '15px',
                })}>若信息有误，请<span className={style({ color: '#E55800' })} onClick={this.applyFaceOCR}>重新拍摄</span></div>
            </div>
        );
    }

    private uploadImage(blob: Blob) {
        Toast.info('数据上传中', 0.5);

        const file = new File([blob], 'file_name');

        QiNiuUpload(file, {
            complete: (r) => {
                console.log(r);
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
                console.log(r);
            },
        });
    }

    private applyFaceOCR = () => {
        FaceOCR({
            isFront: this.isFront === 3 ? 1 : this.isFront,
        }).then((result: any) => {
            const faceOCR = JSON.parse(result.faceOCR);
            this.name = faceOCR.name.result;
            this.cardNumber = faceOCR.idcard_number.result;
            this.uploadImage(result.cardImg);
        }).catch((d) => {
            if (d) {
                Toast.info(d, 3);
            }
        });
    }

    private handleSubmit = () => {
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

export const Ocr = withRouter(withAppState(OcrView));
