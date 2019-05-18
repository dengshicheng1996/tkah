import { Button } from 'common/antd/button';
import { Icon } from 'common/antd/icon';
import { Upload } from 'common/antd/upload';
import { mutate } from 'common/component/restFull';
const qiniu = require('qiniu-js');
import * as React from 'react';
interface UploadPropsType {
    complete: any;
    onError?: any;
    next?: any;
    accept: string;
}
export default class UploadComponent extends React.Component<UploadPropsType, any> {
    private token: string = '';
    constructor(props: any) {
        super(props);
    }
    async componentDidMount() {
        let uploadToken = window.sessionStorage.uploadToken;
        if (!uploadToken ) {
            const json = {
                bucketName: 'tk-file-zone',
            };
            const res = await mutate<{}, any>({
                url: '/api/admin/upload/updateToken',
                method: 'post',
                variables: json,
            });
            uploadToken = res.data;
            window.sessionStorage.uploadToken = uploadToken;
        }
        this.token = uploadToken;
    }
    upload(data: any) {
        const that = this;
        const putExtra: any = {
            fname: this.token.substring(0, 5) + new Date().getTime(),
            params: {},
        };
        const key = this.token.substring(0, 5) + new Date().getTime();
        const obser = qiniu.upload(data.file, key, this.token, putExtra, {});
        obser.subscribe({
            next(res) {
                that.props.next && that.props.next(res);
            },
            error(err) {
                that.props.onError && that.props.onError(err);
            },
            complete(res) {
                that.props.complete && that.props.complete('http://imgcdn.alphae.cn/' +  res.key);
            },
        });
    }
    render() {
        return ( <Upload accept={this.props.accept}
                         customRequest={(data: any) => this.upload(data)}
                         showUploadList={false}
        >
            <Button>
                <Icon type='upload' />上传
            </Button>
        </Upload>);
    }
}
