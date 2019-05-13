import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { Modal } from 'common/antd/modal';
import { Spin } from 'common/antd/spin';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import { Radium } from 'common/radium';
import { mutate, Querier } from 'common/restFull';
import * as _ from 'lodash';
import { autorun, observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { WithAppState, withAppState } from 'operatePlat/common/appStateStore';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
const FormItem = Form.Item;

interface Props {
    form: WrappedFormUtils;
}

@Radium
@observer
export class EditView extends React.Component<RouteComponentProps<any> & WithAppState & Props, {}> {
    query: Querier<any, any> = new Querier(null);
    disposers: Array<() => void> = [];

    @observable private resultData?: any = {};
    @observable private loading?: boolean = false;

    constructor(props: any) {
        super(props);
    }

    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        if (!this.props.match.params.id) {
            return;
        }
        this.disposers.push(autorun(() => {
            this.query.setReq({
                url: `/api/crm/users/${this.props.match.params.id}`,
                method: 'get',
            });
        }));

        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || {};
        }, searchData => {
            this.resultData = searchData;
        }));
    }

    render() {
        const item: BaseFormItem[] = [
            { type: 'input', key: 'phone', label: '手机号', disabled: true, initialValue: this.resultData.phone },
            { type: 'input', key: 'role', label: '角色', initialValue: this.resultData.role_id },
            {
                formItem: false, component: (
                    <FormItem
                        wrapperCol={{
                            xs: { span: 24, offset: 0 },
                            sm: { span: 19, offset: 5 },
                        }}>
                        <Button type='primary' htmlType='submit'>确定</Button>
                        <Button
                            style={{ margin: '0 0 0 10px' }}
                            onClick={() => { this.props.history.push(`/operatePlat/account`); }}>取消</Button>
                    </FormItem>
                ),
            },
        ];

        return (
            <Spin spinning={this.loading}>
                <div style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    padding: 24,
                }}>
                    {
                        this.props.match.params.id ?
                            '修改账户信息' : '新增账户信息'
                    }
                </div>
                <br />
                <BaseForm form={this.props.form} item={item} />
            </Spin>
        );
    }

    private handleSubmit = (ev: any) => {
        ev.preventDefault();
        this.props.form.validateFields((err: any, values: any) => {
            if (!err) {
                this.loading = true;
                const json: any = {
                    year: values.year,
                    semester: values.semester,
                    opened_date: values.date[0].format('YYYY-MM-DD'),
                    closed_date: values.date[1].format('YYYY-MM-DD'),
                };

                if (this.props.match.params.id) {
                    json['id'] = this.props.match.params.id;
                }

                mutate<{}, any>({
                    url: '',
                    variables: json,
                }).then(r => {
                    this.loading = false;
                    if (r.data.courseArrangement.base.setSemester.status === 'ok') {
                        Modal.success({
                            title: '提示',
                            content: '操作成功',
                            onOk: () => {
                                this.props.history.push(`/course-arrangement/base-info/semester`);
                            },
                        });
                    }
                    if (r.data.courseArrangement.base.setSemester.status === 'error') {
                        let content = `Error: ${JSON.stringify(r.data.courseArrangement.base.setSemester.error_msg)}`;
                        if (r.data.courseArrangement.base.setSemester.sub_kind === 'errs_tip:exist') {
                            content = '学年学期的两个输入值，与已存在的条目完全重合';
                        }
                        if (r.data.courseArrangement.base.setSemester.sub_kind === 'errs_tip:overlapping') {
                            content = '设定的时间跨度，不能与已存在的条目中的时间跨度有任何重叠';
                        }
                        if (r.data.courseArrangement.base.setSemester.sub_kind === 'errs_tip:not_match') {
                            content = '当前两项都满足条件后，判定选择的开始日期是否符合学年范围';
                        }
                        if (r.data.courseArrangement.base.setSemester.sub_kind === 'errs_tip:exceed') {
                            content = '判定设定的时间跨度，最大长度不能超过366天';
                        }
                        Modal.error({
                            title: '警告',
                            content,
                        });
                        return;
                    }
                }, error => {
                    this.loading = false;
                    Modal.error({
                        title: '警告',
                        content: `Error: ${JSON.stringify(error)}`,
                    });
                });
            }
        });
    }

}

const formCreate = Form.create()(withAppState(EditView));

export const Edit = withRouter(formCreate);
