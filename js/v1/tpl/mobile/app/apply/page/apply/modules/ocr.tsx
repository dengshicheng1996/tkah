import { Button } from 'common/antd/mobile/button';
import { List } from 'common/antd/mobile/list';
import { Toast } from 'common/antd/mobile/toast';
import { FaceOCR, NavBarBack, NavBarTitle } from 'common/app';
import { ConvertBase64UrlToBlob } from 'common/fun';
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
                <List>
                    <List.Item extra={this.name}>姓名</List.Item>
                    <List.Item extra={this.cardNumber}>身份证</List.Item>
                </List>
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

        const formData = new FormData();
        formData.append('file', blob);

        QiNiuUpload(formData, {
            complete: (r) => {
                console.log(r);
            },
            onError: (r) => {
                console.log(r);
            },
        });
    }

    private applyFaceOCR = () => {
        FaceOCR({
            isFront: this.isFront,
        }).then((result: any) => {
            console.log(JSON.parse(result.faceOCR));
            // const blob = ConvertBase64UrlToBlob(result.cardImg);
            // console.log(blob);
            // this.uploadImage(blob);
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
