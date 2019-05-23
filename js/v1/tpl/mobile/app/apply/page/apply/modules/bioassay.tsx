import { Button } from 'common/antd/mobile/button';
import { Flex } from 'common/antd/mobile/flex';
import { List } from 'common/antd/mobile/list';
import { staticBaseURL } from 'common/staticURL';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

export class BioassayView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private reminder = [
        {
            url: 'reminder_1.png',
            description: '不能戴墨镜',
        },
        {
            url: 'reminder_2.png',
            description: '不能戴帽子',
        },
        {
            url: 'reminder_3.png',
            description: '光线不能太暗',
        },
    ];

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className={style({
                    fontSize: '14px',
                    textAlign: 'center',
                    marginBottom: '35px',
                })}>验证时，请将镜头对准您的脸，按提示操作。</div>
                <Flex className={style({
                    marginBottom: '70px',
                })}>
                    <Flex.Item className={style({
                        textAlign: 'center',
                    })}>
                        <div>
                            <img src={staticBaseURL('reminder.png')}
                                className={style({
                                    border: '1px solid #E55800',
                                    padding: '7px',
                                    borderRadius: '50%',
                                })}
                                width='100px' height='100px' />
                        </div>
                    </Flex.Item>
                </Flex>
                <Flex>
                    {
                        this.reminder.map((r, i) => {
                            return (
                                <Flex.Item key={i} className={style({
                                    textAlign: 'center',
                                })}>
                                    <div><img src={staticBaseURL(r.url)}
                                        className={style({
                                            border: '1px solid rgba(216,216,216,1)',
                                            padding: '7px',
                                            borderRadius: '50%',
                                        })}
                                        width='72px'
                                        height='72px' /></div>
                                    <div className={style({
                                        marginTop: '10px',
                                        color: '#666666',
                                        fontSize: '14px',
                                    })}>{r.description}</div>
                                </Flex.Item>
                            );
                        })
                    }
                </Flex>
            </div>
        );
    }

    private resetPhone = () => {
        console.log('resetPhone');
    }

    private handleSubmit = () => {
        const stepInfo = this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber + 1];

        if (stepInfo) {
            this.props.history.push(`/apply/module/${stepInfo.page_type === 1 ? 'single' : 'multiple'}/${stepInfo.id}`);
        } else {
            this.props.history.push(`/apply/home`);
        }
    }

}

export const Bioassay = withRouter(withAppState(BioassayView));
