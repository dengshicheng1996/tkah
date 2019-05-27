import { ActivityIndicator } from 'common/antd/mobile/activity-indicator';
import { Button } from 'common/antd/mobile/button';
import { Flex } from 'common/antd/mobile/flex';
import { Toast } from 'common/antd/mobile/toast';
import { FaceAuth, NavBarBack, NavBarTitle, ShowNewSettingView } from 'common/app';
import { mutate, Querier } from 'common/component/restFull';
import { ConvertBase64UrlToBlob, SearchToObject } from 'common/fun';
import { staticBaseURL } from 'common/staticURL';
import { QiNiuUpload } from 'common/upload';
import * as _ from 'lodash';
import { ModuleUrls } from 'mobile/app/apply/common/publicData';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS, untracked } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

declare const window: any;

@observer
export class OperatorView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private animating: boolean;

    constructor(props: any) {
        super(props);
        NavBarBack(() => {
            this.props.history.push(`/apply/home`);
        });
        NavBarTitle('运营商', () => {
            this.props.data.pageTitle = '运营商';
        });
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        const token = SearchToObject(window.location.search)['jxl_token'] || SearchToObject(window.location.search)['token'];
        if (token) {
            this.handleSubmit(token);
            return;
        }
        this.getURL();
    }

    getURL() {
        this.animating = true;
        this.query.setReq({
            url: `/api/mobile/authdata/phoneoperator`,
            method: 'get',
            variables: {
                callback_url: `${window.location.origin}/apply/module/operator`,
                back_url: `${window.location.origin}/apply/module/operator`,
            },
        });

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || {};
        }, searchData => {
            window.location.href = searchData;
        }));
    }

    render() {
        return (
            <div>
                <ActivityIndicator
                    toast
                    text='Loading...'
                    animating={this.animating}
                />
            </div>
        );
    }

    private handleSubmit = (token: string) => {
        mutate<{}, any>({
            url: '/api/mobile/authdata/phoneoperator',
            method: 'post',
            variables: {
                module_id: this.props.location.state.module_id,
                token,
            },
        }).then(r => {
            this.animating = false;
            if (r.status_code === 200) {
                Toast.info('操作成功', 0.5, () => {
                    this.togoNext();
                });

                return;
            }
            Toast.info(r.message, 0.5, () => {
                this.getURL();
            });
        }, error => {
            this.animating = false;
            Toast.info(`Error: ${JSON.stringify(error)}`);
        });
    }

    private togoNext = () => {
        const { steps, stepNumber } = this.props.location.state;
        if (stepNumber === steps.length - 1) {
            const stepInfo = untracked(() => {
                this.props.data.stepInfo.stepNumber++;
                return this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber];
            });

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

export const Operator = withRouter(withAppState(OperatorView));
