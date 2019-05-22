import { Steps } from 'common/antd/mobile/steps';
import { Radium } from 'common/radium';
import { observer } from 'mobx-react';
import * as React from 'react';

const Step = Steps.Step;

@Radium
@observer
export class Home extends React.Component<{}, {}> {
    constructor(props: any) {
        super(props);
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
