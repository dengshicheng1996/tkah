import { ActivityIndicator } from 'common/antd/mobile/activity-indicator';
import { Modal } from 'common/antd/mobile/modal';
import { Toast } from 'common/antd/mobile/toast';
import { AppFn, NavBarBack, NavBarTitle } from 'common/app';
import { mutate, Querier } from 'common/component/restFull';
import { SearchToObject } from 'common/fun';
import * as $ from 'jquery';
import 'jquery.cookie';
import * as _ from 'lodash';
import { ModuleUrls } from 'mobile/app/apply/common/publicData';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { observable, reaction, toJS, untracked } from 'mobx';
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
            Modal.alert('提示', '您的资料认证未完成，请确认是否退出？', [
                { text: '取消' },
                {
                    text: '确定', onPress: () => {
                        this.props.history.push(`/apply/home`);
                    },
                },
            ]);
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
        const token = $.cookie('third_token');
        if (token) {
            if (this.props.data.moduleInfo.modules && this.props.data.moduleInfo.modules.length > 0) {
                this.handleSubmit(token);
            }
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
                callback_url: `${window.location.origin}/apply/module/${this.props.match.params.id}/${this.props.match.params.kind}/operator?zdgj_token=${$.cookie('token')}`,
                back_url: `${window.location.origin}/apply/module/${this.props.match.params.id}/${this.props.match.params.kind}/operator?zdgj_token=${$.cookie('token')}`,
            },
        });

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || {};
        }, searchData => {
            AppFn.setConfig({
                backDic: {
                    isHidden: 0,
                    appFun: 2,
                    img: 2,
                },
                closeDic: {
                    isHidden: 1,
                    appFun: 0,
                    img: 2,
                },
                finishDic: {
                    isHidden: 0,
                    appFun: 1,
                    img: 3,
                },
            });
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
                module_id: this.props.data.moduleInfo.modules[this.props.data.moduleInfo.moduleNumber].id,
                token,
            },
        }).then(r => {
            this.animating = false;
            if (r.status_code === 200) {
                $.cookie('third_token', null, { path: '/' });

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

export const Operator = withRouter(withAppState(OperatorView));
