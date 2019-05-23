import { Button } from 'common/antd/mobile/button';
import { Icon } from 'common/antd/mobile/icon';
import { Steps } from 'common/antd/mobile/steps';
import { RadiumStyle } from 'common/component/radium_style';
import { Querier } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/mobile/baseForm';
import { Radium } from 'common/radium';
import { regular } from 'common/regular';
import * as _ from 'lodash';
import { withAppState, WithAppState } from 'mobile/common/appStateStore';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { createForm } from 'rc-form';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

const Step = Steps.Step;

@Radium
@observer
class ModuleView extends React.Component<RouteComponentProps<any> & WithAppState & { form: any }, {}> {
    private query: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];

    @observable private loading: boolean = false;
    @observable private resultData: any = [];

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getAuth();
    }

    getAuth() {
        this.query.setReq({
            url: `/api/mobile/authdata/${this.props.match.params.id}`,
            method: 'get',
        });

        this.disposers.push(autorun(() => {
            this.loading = this.query.refreshing;
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.resultData = searchData;
            if (searchData.length > 0 && this.props.match.params.kind === 'multiple') {
                if (searchData[0].key === 'idcard_ocr') {
                    this.gotoOcr(searchData);
                }
            }
        }));
    }

    gotoOcr(steps) {
        console.log(steps);
    }

    render() {
        let formItem = [];
        if (this.props.match.params.kind) {
            formItem = (this.resultData || []).filter((r: { type: number; html_type: string }) => r.type === 1 && r.html_type !== 'hidden').map((r: any, i: any) => {
                const item: BaseFormItem = {
                    key: r.key,
                    type: r.html_type,
                    itemProps: { label: r.name },
                    required: true,
                    options: r.options,
                };

                if (r.html_type === 'inputPhone') {
                    item['fieldDecoratorOptions'] = {
                        rules: [
                            {
                                required: true,
                                message: '请输入手机号',
                            },
                            {
                                validator: (rule: any, value: any, callback: any) => {
                                    if (!value) {
                                        callback('请输入手机号');
                                        return;
                                    }
                                    const reg = new RegExp(regular.phone_number.reg);
                                    if (!reg.test(value.replace(/\s+/g, '')) && value) {
                                        callback('格式错误，请正确输入手机号');
                                        return;
                                    }
                                    callback();
                                },
                            },
                        ],
                    };
                }
                return item;
            });
        }

        return (
            <div>
                <RadiumStyle scopeSelector={['.apply']}
                    rules={{
                        '.am-list-body .am-list-item.am-list-item-middle': {
                            paddingLeft: '0',
                        },
                        '.am-steps-vertical .am-steps-item-description': {
                            paddingBottom: '20px',
                            color: '#666',
                        },
                    }} />
                {
                    this.props.match.params.kind === 'multiple' && (this.resultData || []).length > 1 ?
                        (
                            <Steps status='wait' current={0}>
                                {
                                    (this.resultData || []).map((r: any, i: number) => {
                                        return (
                                            <Step key={i} status={r.status}
                                                title={r.name}
                                                icon={<Icon type='check-circle' />}
                                                description={r.docs} />
                                        );
                                    })
                                }
                            </Steps>
                        ) : this.props.match.params.kind === 'single' ? (
                            <div>
                                <BaseForm form={this.props.form}
                                    item={formItem} />
                                <Button type='primary'
                                    style={{ marginTop: '80px' }}
                                    onClick={this.handleSubmit}>下一步</Button>
                            </div>
                        ) : null
                }
            </div>
        );
    }

    private handleSubmit = () => {
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                let jsonData = [];
                if (this.props.match.params.kind) {
                    jsonData = (this.resultData || []).map((r: any, i: any) => {
                        const item = {
                            id: r.id,
                            value: r.html_type === 'select' && values[r.key] ? values[r.key][0] : values[r.key],
                        };
                        return item;
                    });
                }
                console.log(jsonData);
                console.log(values);
                const stepInfo = this.props.data.stepInfo.steps[this.props.data.stepInfo.stepNumber + 1];

                if (stepInfo) {
                    this.props.history.push(`/apply/module/${stepInfo.page_type === 1 ? 'single' : 'multiple'}/${stepInfo.id}`);
                } else {
                    this.props.history.push(`/apply/home`);
                }

            }
        });
    }
}

const FormCreate: typeof ModuleView = createForm()(withRouter(withAppState(ModuleView)));

export const Module = FormCreate;
