import { Form } from 'common/antd/form';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { ComponentFormItem, TypeFormItem } from 'common/formTpl/baseForm';
import {getSearch, objectToOption, setSearch} from 'common/tools';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {withAppState} from '../../../../common/appStateStore';
import Title from '../../../../common/TitleComponent';

@observer
class Account extends React.Component<any, any> {
    private tableRef: TableList;
    @observable private channel: any[] = [];
    constructor(props: any) {
        super(props);
    }
    beforeRequest(data: any) {
        const json: any = data;
        setSearch(this.props.data.appState.panes, this.props.data.appState.activePane, Object.assign({}, data));
        if (data.time && data.time.length > 0) {
            json.start_date = data.time[0].format('YYYY-MM-DD');
            json.end_date = data.time[1].format('YYYY-MM-DD');
            delete json.time;
        }
        return json;
    }
    componentDidMount() {
        mutate<{}, any>({
            url: '/api/admin/basicconfig/searchchannel',
            method: 'get',
        }).then(r => {
            if (r.status_code === 200) {
                this.channel = objectToOption(r.data);
            }
        });
    }

    render() {
        const columns = [
            { title: '手机号', key: 'phone', dataIndex: 'phone' },
            { title: '姓名', key: 'name', dataIndex: 'name' },
            { title: '渠道名称', key: 'channel_name', dataIndex: 'channel_name' },
            { title: '访问时间', key: 'created_at', dataIndex: 'created_at' },
        ];
        const search: Array<TypeFormItem | ComponentFormItem> = [
            { itemProps: { label: '客户姓名' }, typeComponentProps: { placeholder: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '客户手机号' }, typeComponentProps: { placeholder: '客户手机号' }, key: 'phone', type: 'input' },
            {
                itemProps: { label: '渠道名称', hasFeedback: false }, typeComponentProps: { showSearch: true }, key: 'channel_id', type: 'select', options: this.channel,
            },
            { itemProps: { label: '访问时间' }, key: 'time', type: 'rangePicker' },
        ];
        return (
            <Title>
                <SearchTable
                    ref={(ref) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/customer/channel/visit/log'
                    tableProps={{ columns }}
                    query={{ search }}
                    autoSearch={getSearch(this.props.data.appState.panes, this.props.data.appState.activePane)}
                    beforeRequest={(data) => this.beforeRequest(data)}
                />
            </Title>
        );
    }
}
const ExportViewCom: any = Form.create()(Account);
export default withAppState(ExportViewCom);
