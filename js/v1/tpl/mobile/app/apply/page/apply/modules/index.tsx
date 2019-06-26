import { Icon } from 'common/antd/mobile/icon';
import { Modal } from 'common/antd/mobile/modal';
import { Steps } from 'common/antd/mobile/steps';
import { NavBarBack, NavBarTitle } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { observable, reaction, toJS, untracked } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Single } from './single';

const Step = Steps.Step;

@Radium
@observer
class ModuleView extends React.Component<RouteComponentProps<any> & WithAppState & { form: any }, {}> {
    private disposers: Array<() => void> = [];

    @observable private animating: boolean = false;

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
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getAuth();
        this.disposers.push(reaction(() => {
            return toJS(this.props.data.moduleInfo.modules);
        }, searchData => {
            this.getAuth();
        }));
    }

    getAuth() {
        NavBarTitle(this.props.data.moduleInfo.title, () => {
            this.props.data.pageTitle = this.props.data.moduleInfo.title;
        });
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
                {
                    this.props.match.params.kind === 'multiple' && (this.props.data.moduleInfo.modules || []).length > 1 ?
                        (
                            <Steps status='wait' current={0}>
                                {
                                    (this.props.data.moduleInfo.modules || []).map((r: any, i: number) => {
                                        return (
                                            <Step key={i} status={r.status}
                                                title={r.name}
                                                icon={<Icon type='check-circle' />}
                                                description={r.docs} />
                                        );
                                    })
                                }
                            </Steps>
                        ) : this.props.match.params.kind === 'single' ? (
                            <Single />
                        ) : null
                }
            </div>
        );
    }
}

export const Module = withRouter(withAppState(ModuleView));
