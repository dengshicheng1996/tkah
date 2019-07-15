import { Button } from 'common/antd/button';
import { Icon } from 'common/antd/icon';
import {message} from 'common/antd/message';
import { Upload } from 'common/antd/upload';
import { QiNiuUpload } from 'common/upload';
import * as React from 'react';
interface UploadPropsType {
    complete: any;
    onError?: any;
    next?: any;
    accept?: string;
    fileType?: any[];
    fileName?: string[];
}
export default class UploadComponent extends React.Component<UploadPropsType, any> {
    constructor(props: any) {
        super(props);
    }
    testFile(file: any, fileType: any[], fileName?: string[]) {
        if (fileType && fileType.length > 0) {
            if (file.type === '' && fileName) { // 检测不到file.type 检测name是否包含
                return fileName.some((item: string) => file.name.indexOf(item) > -1);
            } else {
                if (fileType.indexOf(file.type) > -1) {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return true;
        }
    }
    render() {
        return (<Upload accept={this.props.accept}
            customRequest={(data: any) => {
                if (this.testFile(data.file, this.props.fileType, this.props.fileName)) {
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
