import { Button } from 'common/antd/mobile/button';
import { Toast } from 'common/antd/mobile/toast';
import { RadiumStyle } from 'common/component/radium_style';
import { mutate, Querier } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/mobile/baseForm';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
import { staticBaseURL } from 'common/staticURL';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { createForm } from 'rc-form';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';
import { Frame } from './frame';
import { ModalBank } from './modal/bank';
import { ModalInfo } from './modal/info';

@Radium
@observer
export class RepaymentView extends React.Component<RouteComponentProps<any> & WithAppState & { form: any }, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private payModal: boolean = false;
    @observable private loading: boolean = true;
    @observable private resultData: any = [];
    @observable private bankListData: any = [];

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
            url: '/api/wap/bankbf',
            method: 'get',
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.bankListData = searchData;
        }));
    }

    render() {
        const formItem: BaseFormItem[] = [
            {
                key: 'bank_num',
                component: (
                    <div style={{ margin: '0 15px 7px', fontSize: '15px' }}>
                        <span>银行卡</span>
                        <span style={{
                            fontSize: '12px',
                            borderRadius: '3px',
                            border: '1px solid rgba(229,88,0,1)',
                            color: 'rgba(229,88,0,1)',
                            padding: '1px 3px',
                            marginLeft: '5px',
                        }}>必填</span>
                    </div>
                ),
            },
            {
                key: 'bank_num',
                type: 'inputBankCard',
                typeComponentProps: { cols: 1, style: { textAlign: 'left' }, placeholder: '请输入银行卡' },
                required: true,
            },
        ];
        return (
            <Frame title='绑定银行卡'
                bg={staticBaseURL('bg_card.png')}
                fullHeight={true}
                footer={(
                    <div style={{ padding: '10px 0' }}>
                        <Button type='primary'
                            onClick={this.switchDetail}>支付</Button>
                    </div>
                )}>
                <RadiumStyle scopeSelector={['.bill']}
                    rules={{
                        '.baseform .am-list-body::before, .am-list-body::after,.am-list-body div .am-list-line::after': {
                            height: '0px !important',
                        },
                        '.baseform .am-list-line': {
                            border: '1px solid rgba(151,151,151,0.16) !important',
                            background: 'rgba(247,247,247,1)',
                            borderRadius: '5px',
                            padding: '12px 10px',
                        },
                    }} />
                <div className={style({
                    margin: '0 -20px',
                })}>
                    <div className='baseform'>
                        <BaseForm form={this.props.form}
                            item={formItem} />
                    </div>
                </div>
                <ModalBank modal={this.payModal} onChangeModal={this.switchDetail} />
            </Frame>
        );
    }

    private switchDetail = () => {
        this.payModal = !this.payModal;
    }
}

const FormCreate = createForm()(withRouter(withAppState(RepaymentView)));

export const Repayment = FormCreate;
