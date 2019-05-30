import { TableProps } from 'antd/lib/table/interface';
import { Button } from 'common/antd/button';
import { Form } from 'common/antd/form';
import { message } from 'common/antd/message';
import { Modal } from 'common/antd/modal';
import { mutate } from 'common/component/restFull';
import { SearchTable, TableList } from 'common/component/searchTable';
import { BaseForm, BaseFormItem } from 'common/formTpl/baseForm';
import * as _ from 'lodash';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import Title from '../../../../common/TitleComponent';

@observer
class Account extends React.Component<any, any> {
    private tableRef: TableList;
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        // mutate<{}, any>({
        //     url: '/api/admin/account/allroles',
        //     method: 'get',
        //     // variables: json,
        // }).then(r => {
        //     if (r.status_code === 200) {
        //         this.roleInfo = r.data;
        //     }
        // });
    }

    render() {
        const columns = [
            { title: '手机号', key: 'remark', dataIndex: 'remark' },
            { title: '姓名', key: 'mobile', dataIndex: 'mobile' },
            { title: '渠道名称', key: 'role_name', dataIndex: 'role_name' },
            { title: '状态', key: 'status', dataIndex: 'status', render(status: number | string) { return +status === 1 ? '已启用' : '已禁用'; } },
            { title: '访问时间', key: 'created_at', dataIndex: 'created_at' },
        ];
        const search: BaseFormItem[] = [
            { itemProps: { label: '客户姓名' }, typeComponentProps: { placeholder: '客户姓名' }, key: 'name', type: 'input' },
            { itemProps: { label: '客户手机号' }, typeComponentProps: { placeholder: '客户手机号' }, key: 'phone', type: 'input' },
            {
                itemProps: { label: '渠道名称', hasFeedback: false }, key: 'channel', type: 'select', options: [],
            },
            { itemProps: { label: '访问时间' }, key: 'time', type: 'rangePicker' },
        ];
        return (
            <Title>
                <SearchTable
                    ref={(ref) => { this.tableRef = ref; }}
                    requestUrl='/api/admin/account/users'
                    tableProps={{ columns }}
                    query={{ search }}
                />
            </Title>
        );
    }
}
const ExportViewCom = Form.create()(Account);
export default ExportViewCom;
