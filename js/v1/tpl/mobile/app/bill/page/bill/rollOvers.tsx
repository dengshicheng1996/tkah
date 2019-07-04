import { Button } from 'common/antd/mobile/button';
import { Icon } from 'common/antd/mobile/icon';
import { Modal } from 'common/antd/mobile/modal';
import { Toast } from 'common/antd/mobile/toast';
import { AppFn, NavBarBack, NavBarTitle } from 'common/app';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate, Querier } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/mobile/baseForm';
import { Radium } from 'common/radium';
import { staticImgURL } from 'common/staticURL';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';
import { ModalBank } from './modal/bank';
import { ModalVerify } from './modal/verify';

@Radium
@observer
export class RollOversView extends React.Component<RouteComponentProps<any> & WithAppState, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];
    private contractObj: { name: string, contract_file_url: string };

    @observable private loading: boolean = true;
    @observable private resultData: any;

    @observable private payModal: boolean = false;
    @observable private verifyModal: boolean = false;
    @observable private data: any;
    @observable private submit: boolean = false;
    @observable private contract: boolean = true;
    @observable private modalContract: boolean = false;

    constructor(props: any) {
        super(props);
        AppFn.setConfig({
            backDic: {
                isHidden: 0,
                appFun: 0,
                img: 1,
            },
            closeDic: {
                isHidden: 1,
                appFun: 0,
                img: 2,
            },
            finishDic: {
                isHidden: 1,
                appFun: 0,
                img: 3,
            },
        });
        NavBarBack(() => {
            this.props.history.push(`/bill/home`);
        });
        NavBarTitle('展期', () => {
            this.props.data.pageTitle = '展期';
        });
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        this.query.setReq({
            url: `/api/mobile/order/extension/${this.props.match.params.id}`,
            method: 'get',
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || {};
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    render() {
        if (!this.resultData) {
            return (<div></div>);
        }

        return (
            <div style={{ position: 'absolute' }}>
                <RadiumStyle scopeSelector={['.bill']}
                    rules={{
                        '.arc': {
                            width: '100%',
                            height: '130px',
                            top: 0,
                            position: 'absolute',
                            zIndex: -'1',
                            overflow: 'hidden',
                        },
                        '.arc::after': {
                            content: `''`,
                            width: '100%',
                            height: '130px',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            zIndex: -1,
                            borderRadius: '0 0 80% 80%',
                            backgroundColor: '#E55800',
                        },
                    }} />
                <div className='arc'></div>
                <div style={{
                    backgroundColor: 'rgba(255,255,255,1)',
                    backgroundImage: `url(${staticImgURL('roll_overs_bg.png')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    boxShadow: '0px 1px 5px 0px rgba(0,0,0,0.1)',
                    borderRadius: '10px',
                    margin: '30px 15px 0',
                    padding: '35px',
                    textAlign: 'center',
                }}>
                    <div>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            lineHeight: '25px',
                        }}>展期费用：{this.resultData.extension.total_fee}</div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'rgba(153,153,153,1)',
                            lineHeight: '19px',
                        }}>（包括：展期费用手续费：{this.resultData.extension.fee}元，利息+罚息：{this.resultData.extension.total_unpaid}元）</div>
                    </div>
                    <div style={{
                        marginTop: '35px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'rgba(76,76,76,1)',
                        lineHeight: '20px',
                    }}>
                        <div>展期天数：{this.resultData.extension.days}天（日利率{this.resultData.extension.fee}）</div>
                        <div>展期还款日期：<span style={{ color: '#E55800' }}>{this.resultData.extension.newest_repay_date}</span></div>
                    </div>
                </div>
                {
                    (this.resultData.extension.contract || []).length > 0 &&
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <Icon type={this.contract ? 'check-circle' : 'check-circle-o'}
                            size='xs'
                            style={{ marginRight: '5px' }}
                            color={this.contract ? '#6BBB12' : ''}
                            onClick={() => { this.contract = !this.contract; }} />
                        <span style={{ color: '#727272', verticalAlign: 'super' }}>我已阅读并确认</span>
                        {
                            (this.resultData.extension.contract || []).map((r: any, i: number) => {
                                return (
                                    <span key={i}
                                        style={{ color: '#F94B00', verticalAlign: 'super' }}
                                        onClick={() => {
                                            this.contractObj = r;
                                            this.modalContract = true;
                                        }}>《{r.name}》</span>
                                );
                            })
                        }
                    </div>
                }
                <Button type='primary' style={{ margin: '75px 30px 0' }}
                    onClick={this.switchDetail}>确认展期</Button>
                <ModalBank modal={this.payModal}
                    money={this.resultData.extension.total_fee}
                    onChangeModal={this.switchDetail}
                    onSubmit={this.onSubmit} />
                <ModalVerify modal={this.verifyModal}
                    phone={this.data && this.data.phone}
                    onChangeModal={this.switchVerify}
                    onSubmit={this.onSubmit} />
                <Modal
                    visible={this.modalContract}
                    transparent
                    className='modal-contract'
                    title={this.contractObj && this.contractObj.name}
                    maskClosable={true}
                    onClose={() => { this.modalContract = false; }}
                    footer={[
                        {
                            text: '关闭',
                            onPress: () => { this.modalContract = false; },
                            style: {
                                color: '#000',
                            },
                        },
                    ]}
                >
                    <div style={{ height: '70vh' }}>
                        <iframe
                            marginWidth={0}
                            marginHeight={0}
                            width='100%'
                            height='100%'
                            src={this.contractObj && this.contractObj.contract_file_url}
                            frameBorder={0} />
                    </div>
                </Modal>
            </div>
        );
    }

    private switchVerify = () => {
        this.verifyModal = !this.verifyModal;
    }

    private switchDetail = () => {
        if (this.payModal) {
            this.data = undefined;
        } else if (!this.contract) {
            Toast.info('未签署合同不可展期');
            return;
        }
        this.payModal = !this.payModal;
    }

    private onSubmit = (info: any) => {
        if (!this.contract) {
            Toast.info('未签署合同不可展期');
            return;
        }

        if (!this.submit) {
            Toast.info('提交中……', 0);
            this.submit = true;
            let json = {};
            if (this.data) {
                json = _.assign({}, this.data, {
                    verify_code: info.verifyCode,
                });
            } else {
                json = {
                    bank_id: info.id,
                };
            }

            mutate<{}, any>({
                url: `/api/mobile/order/extension/pay/${this.props.match.params.id}`,
                method: 'post',
                variables: json,
            }).then(r => {
                Toast.hide();
                this.submit = false;
                if (r.status_code === 200) {
                    if (r.data.verify_code) {
                        Toast.info('验证码已发送');
                        this.data = json;
                        this.switchVerify();
                        return;
                    }
                    this.data = undefined;
                    this.props.history.push(`/bill/status/rollOvers/${this.resultData.extension.total_fee}`);
                    return;
                }
                Toast.info(r.message);
            }, error => {
                Toast.hide();
                this.submit = false;
                Toast.info(`Error: ${JSON.stringify(error)}`);
            });
        }
    }
}

export const RollOvers = withRouter(withAppState(RollOversView));
