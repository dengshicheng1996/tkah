import { Icon } from 'common/antd/mobile/icon';
import { List } from 'common/antd/mobile/list';
import { Modal } from 'common/antd/mobile/modal';
import { RadiumStyle } from 'common/component/radium_style';
import { Querier } from 'common/component/restFull';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

interface ModalBankProps {
    url?: string;
}

@Radium
@observer
class ModalBankView extends React.Component<RouteComponentProps<any> & WithAppState & ModalBankProps, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private modal: boolean = true;
    @observable private resultData: any = [];
    @observable private stepNumber: number = -1;
    @observable private animating: boolean = false;

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    render() {
        return (
            <div>
                <RadiumStyle scopeSelector={['.bill']}
                    rules={{
                        '.moda-bank .am-modal-header': {
                            borderBottom: '1px #E5E5E5 solid',
                            padding: '0 15px 8px',
                        },
                        '.moda-bank .am-list-body::before': {
                            height: '0',
                        },
                    }} />
                <Modal
                    visible={this.modal}
                    transparent
                    className='moda-bank'
                    title={(
                        <div>
                            <Icon type='cross'
                                color='#666666'
                                size='md'
                                className={style({
                                    position: 'absolute',
                                    left: '15px',
                                    top: '12px',
                                })} />
                            <span>支付</span>
                        </div>
                    )}
                    maskClosable={false}
                >
                    <div className={style({
                        paddingTop: '20px',
                    })}>
                        <div className={style({
                            fontSize: '30px',
                            color: '#333',
                        })}>￥1500.00</div>
                        <List style={{ marginTop: '20px' }}>
                            <List.Item
                                thumb='https://zos.alipayobjects.com/rmsportal/dNuvNrtqUztHCwM.png'
                                arrow='horizontal'
                                onClick={() => { }}
                            >My wallet</List.Item>
                        </List>
                        <div className={style({
                            marginTop: '20px',
                            background: 'rgba(46,194,95,1)',
                            borderRadius: '6px',
                            color: '#fff',
                            padding: '11px',
                            fontSize: '16px',
                        })}>确认支付</div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export const ModalBank = withRouter(withAppState(ModalBankView));
