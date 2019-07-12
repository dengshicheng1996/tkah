import { Button } from 'common/antd/button';
import { Icon } from 'common/antd/icon';
import { Upload } from 'common/antd/upload';
import { QiNiuUpload } from 'common/upload';
import * as React from 'react';
import {message} from "../antd/message";
interface UploadPropsType {
    complete: any;
    onError?: any;
    next?: any;
    accept?: string;
    fileType?: any[];
}
export default class UploadComponent extends React.Component<UploadPropsType, any> {
    constructor(props: any) {
        super(props);
    }
    testFile(file: any, fileType: any[]) {
        if (fileType && fileType.length > 0) {
            console.log(file.type);
            if (fileType.indexOf(file.type) > -1) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }
    render() {
        return (<Upload accept={this.props.accept}
            customRequest={(data: any) => {
                if (this.testFile(data.file, this.props.fileType)) {
                    QiNiuUpload(data.file, this.props);
                    return {abort: () => ''};
                } else {
                    message.error('请上传正确的文件');
                    return {abort: () => ''};
                }
            }}
            showUploadList={false}>
            <Button>
                <Icon type='upload' />上传
            </Button>
        </Upload>);
    }
}
