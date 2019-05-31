import { Button } from 'common/antd/button';
import { Icon } from 'common/antd/icon';
import { Upload } from 'common/antd/upload';
import { QiNiuUpload } from 'common/upload';
import * as React from 'react';
interface UploadPropsType {
    complete: any;
    onError?: any;
    next?: any;
    accept?: string;
}
export default class UploadComponent extends React.Component<UploadPropsType, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (<Upload accept={this.props.accept}
            customRequest={(data: any) => {
                QiNiuUpload(data.file, this.props);
                return {abort: () => ''};
            }}
            showUploadList={false}>
            <Button>
                <Icon type='upload' />上传
            </Button>
        </Upload>);
    }
}
