import { Querier } from 'common/component/restFull';
import * as _ from 'lodash';
import { ModuleUrls } from 'mobile/app/apply/common/publicData';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, computed, observable, reaction, toJS, untracked } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { routes } from './routes';

@observer
export class BaseView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    @computed get id(): string {
        return this.props.match.params.id;
    }
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private loading: boolean = true;
    @observable private ongoto: boolean = true;

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
            url: `/api/mobile/authdata/module/${this.id}`,
            method: 'get',
        });

        // this.disposers.push(autorun(() => {
        //     this.loading = this.query.refreshing;
        // }));

        this.disposers.push(reaction(() => {
            return {
                id: this.id,
            };
        }, searchData => {
            this.query.setReq({
                url: `/api/mobile/authdata/module/${this.id}`,
                method: 'get',
            });
        }));

        this.disposers.push(reaction(() => {
            return toJS(this.props.data.stepInfo);
        }, searchData => {
            if (this.props.data.stepInfo.steps.length > 0 && this.props.data.moduleInfo.modules.length > 0 && this.ongoto) {
                this.ongoto = false;
                this.goto();
            }
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || { title: '', list: [] };
        }, searchData => {
            this.props.data.moduleInfo.moduleNumber = -1;
            searchData.list.forEach((r: { fill_status: number; }, i: number) => {
                if (r.fill_status === 2) {
                    this.props.data.moduleInfo.moduleNumber = i;
                }
            });

            this.props.data.moduleInfo.title = searchData.title;
            this.props.data.moduleInfo.modules = searchData.list;
            this.goto();
        }));
    }

    render() {
        return (
            <div>{!this.loading && this.props.children}</div>
        );
    }

    private goto = () => {
        if (this.props.data.stepInfo.steps.length === 0 || this.props.data.moduleInfo.modules.length === 0) {
            return;
        }
        this.loading = false;

        if (this.props.match.params.kind === 'multiple') {
            if (this.props.data.moduleInfo.moduleNumber === this.props.data.moduleInfo.modules.length - 1) {
                const stepInfo = untracked(() => {
                    this.props.data.stepInfo.stepNumber++;
                    return this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber];
                });

                if (stepInfo) {
                    this.props.history.push(`/apply/module/${stepInfo.id}/${stepInfo.page_type === 1 ? 'single' : 'multiple'}`);
                } else {
                    this.props.history.push(`/apply/home`);
                }
                return;
            }
            this.props.data.moduleInfo.moduleNumber++;
            this.props.history.push(ModuleUrls(this.props.data.moduleInfo.modules[this.props.data.moduleInfo.moduleNumber].key, this.props.match.params.id, this.props.match.params.kind));
        }
    }

}

export const Base = withRouter(withAppState(BaseView));
