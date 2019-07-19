import { Button } from 'common/antd/mobile/button';
import { Icon } from 'common/antd/mobile/icon';
import { Steps } from 'common/antd/mobile/steps';
import { Toast } from 'common/antd/mobile/toast';
import { AppFn, IsAppPlatform, NavBarBack, NavBarTitle } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate } from 'common/component/restFull';
import { EditSvg, UpSvg } from 'common/component/svg';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { computed, get, observable, toJS, untracked } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

const Step = Steps.Step;

@Radium
@observer
class HomeView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    @observable private submit: boolean = false;

    @computed get stepNumber(): number {
        return this.props.data.stepInfo.stepNumber - 1;
    }

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

    componentDidMount() {
        this.props.data.stepInfo.repeat++;
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
                        (this.props.data.stepInfo.steps || []).map((r: any, i: number) => {
                            return (
                                <Step key={i} status={r.status}
                                    title={r.name}
                                    icon={r.status === 1 ? <UpSvg color='#FF9756' /> : <Icon type='check-circle' />}
                                    description={(
                                        <div className={style({
                                            position: 'relative',
                                        })}>
                                            <span style={{ marginRight: '30px' }}>{r.docs}</span>
                                            {
                                                (r.status === 2 || r.status === 1) && r.can_edit ?
                                                    (
                                                        <div className={style({
                                                            position: 'absolute',
                                                            right: 0,
                                                            top: '-10px',
                                                            width: '42px',
                                                            height: '42px',
                                                        })} onClick={() => {
                                                            this.props.data.stepInfo.stepNumber = i;
                                                            this.props.history.push(`/apply/module/${r.id}/${r.page_type === 1 ? 'single' : 'multiple'}`);
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
                        this.stepNumber === -1 ? '立即认证' : this.stepNumber < (this.props.data.stepInfo.steps || []).length - 1 ? '继续认证' : '提交评估'
                    }</Button>
            </div>
        );
    }

    private handleSubmit = () => {
        if (this.stepNumber === -1 || this.stepNumber < (this.props.data.stepInfo.steps || []).length - 1) {
            this.gotoPage();
        } else if (!this.submit) {
            Toast.info('提交中……', 0);
            this.submit = true;
            mutate<{}, any>({
                url: '/api/mobile/authdata/module',
                method: 'post',
            }).then(r => {
                Toast.hide();
                if (r.status_code === 200) {
                    Toast.info('操作成功', 0.5, () => {
                        this.submit = false;
                        AppFn.actionFinish();
                    });

                    return;
                } else {
                    this.submit = false;
                }
                Toast.info(r.message);
            }, error => {
                Toast.hide();
                this.submit = false;
                Toast.info(`Error: ${JSON.stringify(error)}`);
            });
        }
    }

    private gotoPage = () => {
        const stepInfo = untracked(() => {
            return this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber];
        });

        if (stepInfo) {
            this.props.history.push(`/apply/module/${stepInfo.id}/${stepInfo.page_type === 1 ? 'single' : 'multiple'}`);
        } else {
            this.props.history.push(`/apply/home`);
        }
    }
}

export const Home = withRouter(withAppState(HomeView));
