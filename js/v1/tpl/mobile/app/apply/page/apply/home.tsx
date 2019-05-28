import { ActivityIndicator } from 'common/antd/mobile/activity-indicator';
import { Button } from 'common/antd/mobile/button';
import { Icon } from 'common/antd/mobile/icon';
import { Steps } from 'common/antd/mobile/steps';
import { Toast } from 'common/antd/mobile/toast';
import { AppFn, IsAppPlatform, NavBarBack, NavBarTitle } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate, Querier } from 'common/component/restFull';
import { EditSvg } from 'common/component/svg';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS, untracked } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

const Step = Steps.Step;

@Radium
@observer
class HomeView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private loading: boolean = false;
    @observable private resultData: any = [];
    @observable private stepNumber: number = -1;
    @observable private animating: boolean = false;

    constructor(props: any) {
        super(props);
        NavBarBack(() => {
            if (IsAppPlatform()) {
                AppFn.actionFinish();
            } else {
                window.history.back();
            }
        });
        NavBarTitle('填写资料', () => {
            this.props.data.pageTitle = '填写资料';
        });
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getAuth();
    }

    getAuth() {
        this.query.setReq({
            url: '/api/mobile/authdata/module',
            method: 'get',
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.props.data.stepInfo.stepNumber = 0;
            (searchData || []).forEach((r: { status: number; }, i: number) => {
                if (r.status === 2) {
                    this.stepNumber = i;
                    this.props.data.stepInfo.stepNumber = i;
                }
            });
            this.resultData = searchData;
            this.props.data.stepInfo.steps = searchData;
        }));
    }

    render() {
        return (
            <div>
                <RadiumStyle scopeSelector={['.apply']}
                    rules={{
                        '.am-steps-vertical .am-steps-item-description': {
                            paddingBottom: '20px',
                            color: '#666',
                        },
                    }} />
                <Steps status='wait' current={this.stepNumber}>
                    {
                        (this.resultData || []).map((r: any, i: number) => {
                            // 状态：0-未填写 1-填写中 2-填写完成
                            return (
                                <Step key={i} status={r.status}
                                    title={r.name}
                                    icon={<Icon type='check-circle' />}
                                    description={(
                                        <div className={style({
                                            position: 'relative',
                                        })}>
                                            <span style={{ marginRight: '30px' }}>{r.docs}</span>
                                            {
                                                (r.status === 2 && r.can_edit) ?
                                                    (
                                                        <div className={style({
                                                            position: 'absolute',
                                                            right: 0,
                                                            top: '-10px',
                                                            width: '42px',
                                                            height: '42px',
                                                        })} onClick={() => {
                                                            this.props.history.push(`/apply/module/${r.page_type === 1 ? 'single' : 'multiple'}/${r.id}`);
                                                        }}>
                                                            <EditSvg />
                                                        </div>
                                                    ) : null
                                            }
                                        </div>
                                    )} />
                            );
                        })
                    }
                </Steps>

                <Button type='primary'
                    style={{ marginTop: '80px' }}
                    onClick={this.handleSubmit}>{
                        this.stepNumber === -1 ? '立即认证' : this.stepNumber < (this.resultData || []).length ? '继续认证' : '提交评估'
                    }</Button>
                <ActivityIndicator
                    toast
                    text='Loading...'
                    animating={this.animating}
                />
            </div>
        );
    }

    private handleSubmit = () => {
        if (this.stepNumber === -1 || this.stepNumber < (this.resultData || []).length) {
            this.gotoPage();
        } else {
            mutate<{}, any>({
                url: '/api/mobile/authdata/module',
                method: 'post',
            }).then(r => {
                this.animating = false;
                if (r.status_code === 200) {
                    Toast.info('操作成功', 0.5, () => {
                        AppFn.actionFinish();
                    });

                    return;
                }
                Toast.info(r.message);
            }, error => {
                this.animating = false;
                Toast.info(`Error: ${JSON.stringify(error)}`);
            });
        }
    }

    private gotoPage = () => {
        const stepInfo = untracked(() => {
            this.props.data.stepInfo.stepNumber++;
            return this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber];
        });

        if (stepInfo) {
            this.props.history.push(`/apply/module/${stepInfo.page_type === 1 ? 'single' : 'multiple'}/${stepInfo.id}`);
        } else {
            this.props.history.push(`/apply/home`);
        }
    }
}

export const Home = withRouter(withAppState(HomeView));
