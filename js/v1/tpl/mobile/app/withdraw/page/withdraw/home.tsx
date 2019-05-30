import { Button } from 'common/antd/mobile/button';
import { Flex } from 'common/antd/mobile/flex';
import { Icon } from 'common/antd/mobile/icon';
import { List } from 'common/antd/mobile/list';
import { Modal } from 'common/antd/mobile/modal';
import { AppFn, IsAppPlatform, NavBarBack, NavBarTitle } from 'common/app';
import { Querier } from 'common/component/restFull';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

@Radium
@observer
class HomeView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private query: Querier<any, any> = new Querier(null);
    private bankListQuery: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private modalBankList: boolean = false;
    @observable private resultData: any;
    @observable private bankListData: any = [];
    @observable private loading: boolean;
    @observable private contract: boolean;
    @observable private selectBank: any;

    constructor(props: any) {
        super(props);
        NavBarBack(() => {
            if (IsAppPlatform()) {
                AppFn.actionFinish();
            } else {
                window.history.back();
            }
        });
        NavBarTitle('提现', () => {
            this.props.data.pageTitle = '提现';
        });
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getBankList();
    }

    getBankList() {
        this.bankListQuery.setReq({
            url: '/api/wap/bindbank',
            method: 'get',
        });

        this.disposers.push(reaction(() => {
            return (_.get(this.bankListQuery.result, 'result.data') as any) || [];
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
                <div style={{ background: '#E55800', textAlign: 'center', padding: '20px 0 30px' }}>
                    <div style={{ fontSize: '14px', color: '#FFB485', margin: '0 0 10px' }}>到账金额（元）</div>
                    <div style={{ fontSize: '40px', color: '#fff' }}>20000.00</div>
                    <Flex style={{ margin: '15px 0 0' }}>
                        <Flex.Item style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#FFB485', lineHeight: '30px' }}>授信金额（元）</div>
                            <div style={{ fontSize: '17px', color: '#fff' }}>2000.00</div>
                        </Flex.Item>
                        <Flex.Item style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#FFB485', lineHeight: '30px' }}>授信金额（元）</div>
                            <div style={{ fontSize: '17px', color: '#fff' }}>2000.00</div>
                        </Flex.Item>
                        <Flex.Item style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#FFB485', lineHeight: '30px' }}>授信金额（元）</div>
                            <div style={{ fontSize: '17px', color: '#fff' }}>2000.00</div>
                        </Flex.Item>
                    </Flex>
                </div>
                <List>
                    <List.Item extra={'extra content'}>Title</List.Item>
                </List>

                <List style={{ margin: '10px 0' }}>
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
                                            pathname: '/withdraw/boundBank',
                                            state: {
                                                callBackUrl: `/withdraw/home`,
                                            },
                                        });
                                    }}
                                >使用新卡付款</List.Item>
                            )
                    }
                </List>
                <div style={{ textAlign: 'center' }}>
                    <Icon type={this.contract ? 'check-circle' : 'check-circle-o'}
                        color={this.contract ? '#6BBB12' : ''}
                        onClick={() => { this.contract = !this.contract; }} />
                </div>
                <Button>提现</Button>

                <Modal
                    visible={this.modalBankList}
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
                                })}
                                onClick={this.switchDetail} />
                            <span>{'选择支付方式'}</span>
                        </div>
                    )}
                    maskClosable={false}
                >
                    <div className={style({
                        paddingTop: '15px',
                    })}>
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
                                            pathname: '/withdraw/boundBank',
                                            state: {
                                                callBackUrl: `/withdraw/home`,
                                            },
                                        });
                                    }}
                                >绑定新的银行卡</List.Item>
                            </List>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }

    private switchDetail = () => {
        this.modalBankList = !this.modalBankList;
    }
}

export const Home = withRouter(withAppState(HomeView));
