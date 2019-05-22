import { Steps } from 'common/antd/mobile/steps';
import { Querier } from 'common/component/restFull';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { autorun, observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

const Step = Steps.Step;

@Radium
@observer
export class Home extends React.Component<{}, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private loading: boolean = false;
    @observable private resultData: any;

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
            this.resultData = searchData;
        }));
    }

    render() {
        return (
            <div>
                <Steps current={1}>
                    <Step title='Step 1' />
                    <Step title='Step 2' />
                    <Step title='Step 3' status='error' />
                    <Step title='Step 4' />
                </Steps>
            </div>
        );
    }

}
