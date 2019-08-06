import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {getSearch, setSearch} from '../../../../../../common/tools';
import {withAppState} from '../../../../../common/appStateStore';
import AddComponent from './addSignature';
interface ChnnelPropsType {
    form: any;
    data: any;
}
@observer
class Channel extends React.Component<ChnnelPropsType, any> {
    private tableRef: TableList;
    @observable private editId: any = '';
    @observable private visible: boolean = false;
    constructor(props: any) {
        super(props);
    }
    add() {
        this.editId = '';
        this.visible = true;
    }
    edit(data: any) {
        this.editId = data.id;
        this.visible = true;
    }
    banSave(data: any) {
        const json = {
            status: +data.status === 1 ? 2 : 1,
        };
        mutate<{}, any>({
            url: '/api/admin/basicconfig/capitalists/' + data.id,
            method: 'put',
            variables: json,
        }).then(r => {
            if (r.status_code === 200) {
                message.success('操作成功');
                this.tableRef.getQuery().refresh();
            } else {
                message.error(r.message);
            }
        });
    }
    beforeRequest(data: any) {
        setSearch(this.props.data.appState.panes, this.props.data.appState.activePane, Object.assign({}, data));
        return data;
    }
    render() {
        const that = this;
        const columns = [
            { title: '签章唯一标识', dataIndex: 'id' },
            {
                title: '签章类型', key: 'capitalists_type', dataIndex: 'capitalists_type', render: (data: string) => {
                    return +data === 1 ? '个人' : '公司';
                },
            },
            {
                title: '名称', dataIndex: 'name',
            },
            { title: '联系人身份证号', dataIndex: 'legal_person_id_number' },
            { title: '联系人手机号', dataIndex: 'legal_person_phone' },
            { title: '统一社会信用代码', dataIndex: 'unified_social_credit_code' },
            {
                title: '状态', dataIndex: 'status', render(data: number | string) {
                    return +data === 1 ? '启用' : '禁用';
                },
            },
            {
                title: '操作', render(data: any) {
                    return (<div>
                        <a style={{ marginRight: '10px' }}
                            onClick={() => that.banSave(data)}>{+data.status === 1 ? '禁用' : '启用'}</a>
                    </div>);
                },
            },
        ];
        return (
            <div>
                <AddComponent
                    onCancel={() => this.visible = false}
                    onOk={() => {this.visible = false; this.tableRef.getQuery().refresh(); }}
                    visible={this.visible}
                    editId={this.editId}
                />
                <SearchTable
                    wrappedComponentRef={(ref: TableList) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/basicconfig/capitalists'
                    tableProps={{ columns }}
                    beforeRequest={(data: any) => this.beforeRequest(data)}
                    autoSearch={getSearch(this.props.data.appState.panes, this.props.data.appState.activePane)}
                    otherComponent={<Button type='primary' onClick={() => that.add()}>新建签章</Button>} />
            </div>
        );
    }
}
const ExportViewCom: any = Form.create()(Channel);
export default withAppState(ExportViewCom);
