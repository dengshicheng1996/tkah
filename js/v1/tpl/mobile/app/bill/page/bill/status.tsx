import { NavBarBack, NavBarTitle } from 'common/app';
import { staticBaseURL } from 'common/staticURL';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

const status = {
    bill: {
        title: '还款结果',
        success: '还款成功',
        successIcon: 'bill.png',
    },
    fee: {
        title: '付款页面',
        success: '还款成功',
        successIcon: 'fee.png',
    },
};

export class StatusView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    constructor(props: any) {
        super(props);
        NavBarBack(() => {
            this.props.history.push(`/bill/home`);
        });
        NavBarTitle(status[this.props.match.params.kind].title, () => {
            this.props.data.pageTitle = status[this.props.match.params.kind].title;
        });
    }

    render() {
        return (
            <div>
                <div style={{ textAlign: 'center', marginTop: '80px' }}>
                    <img src={staticBaseURL(status[this.props.match.params.kind].successIcon)}
                        height='130' />
                    <div style={{
                        marginTop: '25px',
                        fontSize: '17px',
                        fontWeight: 500,
                        color: '#333',
                        lineHeight: '20px',
                    }}>{status[this.props.match.params.kind].success}</div>
                    <div style={{
                        marginTop: '15px',
                        fontSize: '28px',
                        fontWeight: 600,
                        color: '#333',
                        lineHeight: '24px',
                        textIndent: '-20px',
                    }}>￥{this.props.match.params.money}</div>
                </div>
            </div>
        );
    }
}

export const Status = withRouter(withAppState(StatusView));
