import { Button } from 'common/antd/mobile/button';
import { Icon } from 'common/antd/mobile/icon';
import { Steps } from 'common/antd/mobile/steps';
import { RadiumStyle } from 'common/component/radium_style';
import { Querier } from 'common/component/restFull';
import { BaseForm, BaseFormItem } from 'common/formTpl/mobile/baseForm';
import { Radium } from 'common/radium';
import * as _ from 'lodash';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { createForm } from 'rc-form';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { style } from 'typestyle';

const Step = Steps.Step;

@Radium
@observer
class ModuleView extends React.Component<RouteComponentProps<any> & { form: any }, {}> {
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
        }));
    }

    render() {
        let formItem = [];
        if (this.props.match.params.kind) {
            formItem = (this.resultData || []).filter((r: { type: number; }) => r.type === 1).map((r: any, i: any) => {
                const item = {
                    key: r.key,
                    type: r.html_type,
                    itemProps: { label: r.name },
                    required: true,
                    options: r.options,
                };
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
                    }} />
                {
                    this.props.match.params.kind === 'multiple' ?
                        (
                            <div>
                                <RadiumStyle scopeSelector={['.apply']}
                                    rules={{
                                        '.am-steps-vertical .am-steps-item-description': {
                                            paddingBottom: '20px',
                                            color: '#666',
                                        },
                                    }} />
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
                            </div>
                        ) : (
                            <div>
                                <BaseForm form={this.props.form}
                                    item={formItem} />
                                <Button type='primary'
                                    style={{ marginTop: '80px' }}
                                    onClick={this.handleSubmit}>下一步</Button>
                            </div>
                        )
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
            }
        });
    }
}

const FormCreate: typeof ModuleView = createForm()(withRouter(ModuleView));

export const Module = FormCreate;
