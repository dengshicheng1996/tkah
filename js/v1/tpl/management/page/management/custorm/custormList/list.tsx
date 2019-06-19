import { Button } from 'common/antd/button';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { Row } from 'common/antd/row';
import { Spin } from 'common/antd/spin';
import { Tag } from 'common/antd/tag';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import { Between } from 'common/formTpl/modules/between';
import { objectToOption } from 'common/tools';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import Title from '../../../../common/TitleComponent';

@observer
class Account extends React.Component<any, any> {
    private tableRef: TableList;
    @observable private visible: boolean = false;
    @observable private loading: boolean = false;
    @observable private selectedRows: any[] = [];
    @observable private orderStatus: any[] = [];
    @observable private overdueStatus: any[] = [];
    @observable private blackStatus: any[] = [];
    @observable private auditStatus: any[] = [];
    @observable private newChannelList: any[] = [];
    @observable private regChannelList: any[] = [];
    @observable private fillStatus: any[] = [];
    constructor(props: any) {
        super(props);
    }
    async componentDidMount() {
        this.loading = true;
        const res: any = await mutate<{}, any>({
            url: '/api/admin/customer/section',
            method: 'get',
        });
        this.loading = false;
        this.orderStatus = [{ label: '全部', value: '-1' }].concat(objectToOption(res.data.orderStatus));
        this.overdueStatus = [{ label: '全部', value: '-1' }].concat(objectToOption(res.data.overdueStatus));
        this.blackStatus = [{ label: '全部', value: '-1' }].concat(objectToOption(res.data.blackStatus));
        this.auditStatus = [{ label: '全部', value: '-1' }].concat(objectToOption(res.data.auditStatus));
        this.newChannelList = [{ label: '全部', value: '-1' }].concat(objectToOption(res.data.newChannelList));
        this.regChannelList = [{ label: '全部', value: '-1' }].concat(objectToOption(res.data.regChannelList));
        this.fillStatus = [{ label: '全部', value: '-1' }].concat(objectToOption(res.data.fillStatus));
    }
    beforeRequest(data: any) {
        const json: any = data;
        if (data.time && data.time.length > 0) {
            json.startTime = data.time[0].format('YYYY-MM-DD');
            json.endTime = data.time[1].format('YYYY-MM-DD');
            delete json.time;
        }
        if (data.loanNum) {
            const arr = data.loanNum;
            arr[0] === '' ? delete json.loanNumStart : json.loanNumStart = arr[0];
            arr[1] !== '' ? json.loanNumEnd = arr[1] : delete json.loanNumEnd;
            delete json.loanNum;
        }
        if (data.applyNum) {
            const arr = data.applyNum;
            arr[0] !== '' ? json.applyNumStart = arr[0] : delete json.applyNumStart;
            arr[1] !== '' ? json.applyNumEnd = arr[1] : delete json.applyNumEnd;
            delete json.applyNum;
        }
        return json;
    }
    render() {
        const columns = [
            { title: '手机号', key: 'phone', dataIndex: 'phone' },
            { title: '注册时间', key: 'register_at', dataIndex: 'register_at' },
            { title: '注册渠道', key: 'reg_channel_name', dataIndex: 'reg_channel_name' },
            { title: '姓名', key: 'name', dataIndex: 'name' },
            {
                title: '资料信息',
                key: 'fill_status_text',
                render: (data: any) => {
                    const infoObj: any = {
                        addressBook: '通讯录',
                        antiFraudReport: '反欺诈',
                        contact: '紧急联系人',
                        face: '人脸识别',
                        idcardorc: '身份证ocr验证',
                        operatorReport: '运营商报告',
                    };
                    const arr: any = [];
                    (Object.keys(data.fill_information) || []).map((item: any, index: number) => {
                        if (data.fill_information[item]) {
                            arr.push(<Tag style={{marginBottom: '10px'}} key={index} color='#87d068'>{infoObj[item]}</Tag>);
                        }
                    });
                    if (arr.length === 0) {
                        arr.push(<Tag color='red'>未填写</Tag>);
                    }
                    return arr;
                },
            },
            { title: '状态标签',
                key: 'black_status_text',
                render: (data: any) => {
                    const arr = [<Tag style={{marginBottom: '10px'}} key={1} color='#87d068'>{data.fill_status_text}</Tag>];
                    if (data.audit_status) {
                        arr.push(<Tag key={2} color='#87d068'>{data.audit_status_text}</Tag>);
                    }
                    if (data.collection_status && +data.collection_status === 2) {
                        arr.push(<Tag key={3} color='#87d068'>{data.collection_status_text}</Tag>);
                    }
                    if (data.overdue_status && +data.overdue_status === 1) {
                        arr.push(<Tag key={5} color='#87d068'>{data.overdue_status_text}</Tag>);
                    }
                    if (data.order_status) {
                        arr.push(<Tag key={6} color='#87d068'>{data.order_status_text}</Tag>);
                    }
                    if (data.black_status && +data.black_status === 2) {
                        arr.push(<Tag key={4} color='#87d068'>{data.black_status_text}</Tag>);
                    }
                    return arr;
                },
            },
            { title: '负责人', key: 'allocation_status_text', dataIndex: 'allocation_status_text' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '客户手机号' }, key: 'phone', type: 'input' },
            { itemProps: { label: '注册渠道' }, initialValue: '-1', key: 'channel_id_reg', type: 'select', options: this.regChannelList },
            { itemProps: { label: '注册时间' }, key: 'time', type: 'rangePicker' },
            { itemProps: { label: '资料信息' }, initialValue: '-1', key: 'fillStatus', type: 'select', options: this.fillStatus },
            // { itemProps: { label: '分配状态' }, key: 'time', type: 'select', options: this.risk_review },
            // { itemProps: { label: '负责人' }, key: 'recommend', type: 'input', options: this.review },
            { itemProps: { label: '申请次数' }, key: 'applyNum', component: <Between /> },
            { itemProps: { label: '审核状态' }, initialValue: '-1', key: 'auditStatus', type: 'select', options: this.auditStatus },
            { itemProps: { label: '借款次数' }, key: 'loanNum', component: <Between /> },
            { itemProps: { label: '订单状态' }, initialValue: '-1', key: 'orderStatus', type: 'select', options: this.orderStatus },
            { itemProps: { label: '逾期状态' }, initialValue: '-1', key: 'overdueStatus', type: 'select', options: this.overdueStatus },
            { itemProps: { label: '拉黑状态' }, initialValue: '-1', key: 'blackStatus', type: 'select', options: this.blackStatus },
            // { itemProps: { label: '催收状态' }, key: 'assign_status', type: 'select', options: this.assign },
            { itemProps: { label: '最新渠道' }, initialValue: '-1', key: 'channelIdNew', type: 'select', options: this.newChannelList },
            { itemProps: { label: '身份证号' }, key: 'idcardNumber', type: 'input' },
        ];
        // const rowSelection = {
        //     onSelect: (record: any, selected: any, selectedRows: any) => {
        //         if (selected) {
        //             this.selectedRows.push(record.id);
        //         } else {
        //             this.selectedRows.splice(this.selectedRows.indexOf(record.id), 1);
        //         }
        //     },
        // };
        const component = (
            this.loading ? <Spin/> :
            <div>
                <SearchTable
                    ref={(ref) => {
                        this.tableRef = ref;
                    }}
                    query={{ search }}
                    requestUrl='/api/admin/customer/lists'
                    tableProps={{
                        columns,
                        onRow: (r) => {
                            return {
                                onClick: (event: any) => {
                                    this.props.history.push('/management/custorm/list/' + r.id);
                                },
                            };
                        },
                        // rowSelection,
                    }}
                    // otherComponent={
                    //     <div>
                    //         <Button disabled={this.selectedRows.length === 0} style={{marginRight: 20}} type={'primary'}>分配客户负责人</Button>
                    //         <Button disabled={this.selectedRows.length === 0} type={'primary'}>批量拒绝</Button>
                    //     </div>
                    // }
                    beforeRequest={(data) => this.beforeRequest(data)}
                />
            </div>
        );
        return (
            <Switch>
                <Route render={() => <Title>
                    {
                        component
                    }
                </Title>} />
            </Switch>
        );
    }
}
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;
