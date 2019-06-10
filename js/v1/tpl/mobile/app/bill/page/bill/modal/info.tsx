import { Icon } from 'common/antd/mobile/icon';
import { Modal } from 'common/antd/mobile/modal';
import { RadiumStyle } from 'common/component/radium_style';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import * as React from 'react';
import { style } from 'typestyle';

interface ModalInfoProps {
    title?: React.ReactNode;
    modal?: boolean;
    onChangeModal?: () => void;
    style?: React.CSSProperties;
}

@Radium
class ModalInfoView extends React.Component<ModalInfoProps, {}> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div>
                <RadiumStyle scopeSelector={['.bill', '.withdraw']}
                    rules={{
                        '.moda-info .am-modal-header': {
                            padding: '15px 15px 8px',
                            background: 'linear-gradient(119deg,rgba(252,155,4,1) 0%,rgba(247,80,15,1) 100%)',
                        },
                        '.moda-info .am-modal-title': {
                            color: '#fff',
                        },
                        '.moda-info .am-list-body::before': {
                            height: '0',
                        },
                        '.moda-info.am-modal-transparent .am-modal-content': {
                            padding: 0,
                        },
                    }} />
                <Modal
                    visible={this.props.modal}
                    transparent
                    className='moda-info'
                    title={this.props.title}
                    maskClosable={false}
                >
                    <div className={style({
                        paddingTop: '15px',
                        maxHeight: '300px',
                    })} style={this.props.style}>
                        {this.props.children}
                    </div>
                    <div style={{
                        position: 'fixed',
                        left: 0,
                        right: 0,
                        bottom: '5%',
                        textAlign: 'center',
                        zIndex: 9999,
                    }}>
                        <Icon type='cross-circle'
                            color='#fff'
                            style={{
                                width: '50px',
                                height: '50px',
                            }}
                            onClick={() => {
                                this.props.onChangeModal();
                            }} />
                    </div>
                </Modal>
            </div>
        );
    }
}

export const ModalInfo = withAppState(ModalInfoView);
