import { Button } from 'common/antd/mobile/button';
import { Flex } from 'common/antd/mobile/flex';
import { List } from 'common/antd/mobile/list';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

export class BioassayView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className={style({
                    fontSize: '14px',
                    textAlign: 'center',
                    marginBottom: '30px',
                })}>验证时，请将镜头对准您的脸，按提示操作。</div>

                <Flex>
                    <Flex.Item>
                        <div><image /></div>
                        <div className={style({
                            textAlign: 'center',
                        })}>不能戴墨镜</div>
                    </Flex.Item>
                </Flex>
            </div>
        );
    }

    private resetPhone = () => {
        console.log('resetPhone');
    }

    private handleSubmit = () => {
        const jsonData = [];
        console.log(jsonData);
        const stepInfo = this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber + 1];

        if (stepInfo) {
            this.props.history.push(`/apply/module/${stepInfo.page_type === 1 ? 'single' : 'multiple'}/${stepInfo.id}`);
        } else {
            this.props.history.push(`/apply/home`);
        }
    }

}

export const Bioassay = withRouter(withAppState(BioassayView));
