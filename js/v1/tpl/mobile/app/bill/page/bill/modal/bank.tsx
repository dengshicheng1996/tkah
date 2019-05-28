import { Icon } from 'common/antd/mobile/icon';
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
                    wrapProps={{ onTouchStart: () => { } }}
                >
                    <div className={style({
                        paddingTop: '15px',
                    })}>
                        <div className={style({
                            fontSize: '25px',
                            color: '#333',
                        })}>￥1500.00</div>
                        scoll content...<br />
                        scoll content...<br />
                        scoll content...<br />
                        scoll content...<br />
                        scoll content...<br />
                        scoll content...<br />
                    </div>
                </Modal>
            </div>
        );
    }
}

export const ModalBank = withRouter(withAppState(ModalBankView));
