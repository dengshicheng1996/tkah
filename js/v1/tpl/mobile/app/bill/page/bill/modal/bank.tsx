import { Icon } from 'common/antd/mobile/icon';
import { List } from 'common/antd/mobile/list';
import { Modal } from 'common/antd/mobile/modal';
import { RadiumStyle } from 'common/component/radium_style';
import { Querier } from 'common/component/restFull';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { createForm } from 'rc-form';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

interface ModalBankProps {
    modal?: boolean;
    onChangeModal?: () => void;
    onSubmit?: (data: any) => void;
}

@Radium
@observer
class ModalBankView extends React.Component<RouteComponentProps<any> & WithAppState & ModalBankProps, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private modalBankList: boolean = false;
    @observable private bankListData: any = [];
    @observable private selectBank: any;

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getBankList();
    }

    getBankList() {
        this.query.setReq({
            url: '/api/wap/bindbank',
            method: 'get',
        });

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.bankListData = searchData;
            if (searchData.length > 0) {
                this.selectBank = searchData[0];
            }
        }));
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
                        '.moda-bank .pay .am-list-body::before': {
                            height: '0',
                        },
                    }} />
                <Modal
                    visible={this.props.modal}
                    transparent
                    className='moda-bank'
                    title={(
                        <div>
                            <Icon type={this.modalBankList ? 'left' : 'cross'}
                                color='#666666'
                                size='md'
                                className={style({
                                    position: 'absolute',
                                    left: '15px',
                                    top: '12px',
                                })}
                                onClick={this.modalBankList ? this.switchDetail : this.props.onChangeModal} />
                            <span>{this.modalBankList ? '选择支付方式' : '支付'}</span>
                        </div>
                    )}
                    maskClosable={false}
                >
                    <div className={style({
                        paddingTop: '15px',
                    })}>
                        {
                            this.modalBankList ?
                                (
                                    <div className={this.bankListData && this.bankListData.length > 0 ? '' : 'pay'}>
                                        <List>
                                            {
                                                this.bankListData.map((r: any, i: number) => {
                                                    return (
                                                        <List.Item key={i}
                                                            arrow='horizontal'
                                                            onClick={() => { this.selectBank = r; }}
                                                        >{r.bank_name}</List.Item>
                                                    );
                                                })
                                            }
                                            <List.Item
                                                arrow='horizontal'
                                                onClick={() => {
                                                    this.props.history.push({
                                                        pathname: '/bill/boundBank',
                                                        state: {
                                                            callBackUrl: `/bill/repayment/${this.props.match.params.id}`,
                                                        },
                                                    });
                                                }}
                                            >使用新卡付款</List.Item>
                                        </List>
                                    </div>
                                ) : (
                                    <div className='pay'>
                                        <div className={style({
                                            fontSize: '30px',
                                            color: '#333',
                                        })}>￥1500.00</div>
                                        <List style={{ marginTop: '20px' }}>
                                            {
                                                this.selectBank ?
                                                    (
                                                        <List.Item
                                                            arrow='horizontal'
                                                            onClick={this.switchDetail}
                                                        >{this.selectBank.bank_name}</List.Item>
                                                    ) : (
                                                        <List.Item
                                                            arrow='horizontal'
                                                            onClick={() => {
                                                                this.props.history.push({
                                                                    pathname: '/bill/boundBank',
                                                                    state: {
                                                                        callBackUrl: `/bill/repayment/${this.props.match.params.kind}/${this.props.match.params.id}/${this.props.match.params.money}`,
                                                                    },
                                                                });
                                                            }}
                                                        >使用新卡付款</List.Item>
                                                    )
                                            }
                                        </List>
                                        <div className={style({
                                            marginTop: '20px',
                                            background: 'rgba(46,194,95,1)',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            padding: '11px',
                                            fontSize: '16px',
                                        })} onClick={this.handleSubmit}>确认支付</div>
                                    </div>
                                )
                        }
                    </div>
                </Modal>
            </div>
        );
    }

    private switchDetail = () => {
        this.modalBankList = !this.modalBankList;
    }

    private handleSubmit = () => {
        this.props.onSubmit(toJS(this.selectBank));
    }

}

export const ModalBank = withRouter(withAppState(ModalBankView));
