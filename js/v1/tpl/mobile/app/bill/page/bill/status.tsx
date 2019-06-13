import { AppFn, NavBarBack, NavBarFinish, NavBarTitle } from 'common/app';
import { staticImgURL } from 'common/staticURL';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

const status: {
    [key: string]: {
        title: string;
        success: string;
        successIcon: string;
    };
} = {
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
        AppFn.setConfig({
            backDic: {
                isHidden: 1,
                appFun: 0,
                img: 1,
            },
            closeDic: {
                isHidden: 1,
                appFun: 0,
                img: 2,
            },
            finishDic: {
                isHidden: 0,
                appFun: 0,
                img: 4,
            },
        });

        NavBarFinish(() => {
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
                    <img src={staticImgURL(status[this.props.match.params.kind].successIcon)}
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
