import { Button } from 'common/antd/mobile/button';
import { Icon } from 'common/antd/mobile/icon';
import { Steps } from 'common/antd/mobile/steps';
import { RadiumStyle } from 'common/component/radium_style';
import { Querier } from 'common/component/restFull';
import { EditSvg } from 'common/component/svg';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

const Step = Steps.Step;

@Radium
@observer
class HomeView extends React.Component<RouteComponentProps<any>, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private loading: boolean = false;
    @observable private resultData: any = [];
    @observable private stepNumber: number = -1;

    constructor(props: any) {
        super(props);
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
            url: '/api/mobile/authdata',
            method: 'get',
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            (searchData || []).forEach((r: { status: number; }, i: number) => {
                if (r.status === 2) {
                    this.stepNumber = i;
                }
            });
            this.resultData = searchData;
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
                                                r.status !== 2 || (r.status === 2 && r.can_edit) ?
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

                <Button type='primary' style={{ marginTop: '80px' }}>提交评估</Button>
            </div>
        );
    }
}

export const Home = withRouter(HomeView);
