import { Col } from 'common/antd/col';
import { Row } from 'common/antd/row';
import {Table} from 'common/antd/table';
import * as _ from 'lodash';
import { observable, reaction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import {Querier} from '../../common/component/restFull';
import {withAppState} from './appStateStore';
import CardClass from './CardClass';
import Title from './TitleComponent';
interface InfoPropsType {
    url: string;
    name: string;
    data?: any;
    getNameUrl: string;
    location?: any;
}

@observer
class PhoneContactsCom extends React.Component<InfoPropsType, any> {
    private query: Querier<any, any> = new Querier(null);
    private getNameQuery: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];
    @observable private loading: boolean = false;
    @observable private id: string|number;
    @observable private detail: any = {};
    constructor(props: any) {
        super(props);
        this.id = props.match.params.id;
    }
    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }
    setTitle(name: string) {
        this.props.data.appState.panes.map((item: any) => {
            if ('/management' + item.url === this.props.location.pathname) {
                item.title =  '通讯录|' + (name || '');
            }
        });
    }
    componentWillReceiveProps(props: any) {
        if (this.id === props.match.params.id) {
            return;
        } else {
            this.id = props.match.params.id;
            this.init();
        }
    }
    init() {
        // emergencyContact
        // phoneContacts
        this.query.setReq({
            url: this.props.url + '/' + this.id + '/phoneContacts',
            method: 'get',
        });
        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.detail = searchData;
        }));
        if (!this.props.name) {
            this.getNameQuery.setReq({
                url: this.props.getNameUrl + this.id,
                method: 'get',
            });
            this.disposers.push(reaction(() => {
                return (_.get(this.getNameQuery.result, 'result.data') as any) || [];
            }, searchData => {
                this.setTitle(searchData.name);
            }));
        } else {
            this.setTitle(this.props.name);
        }
    }
    componentDidMount() {
        this.init();
    }
    render() {
        const tableColumn: any[] = [];
        Object.keys(this.detail.header || {}).map((item: string, index: number) => {
            tableColumn.push({title: this.detail.header[item], key: item, dataIndex: item});
        });
        (this.detail.list || []).map((item: any, index: number) => item.key = index);
        const table = <Table rowKey={'key'} columns={tableColumn} dataSource={this.detail.list || []} bordered pagination={false} />;
        return (
            <Title>
                <CardClass title={'通讯录'} content={table} />
            </Title>
        );
    }
}
export const PhoneContacts =  withRouter(withAppState(PhoneContactsCom));

@observer
class EmergencyContactCom extends React.Component<InfoPropsType, any> {
    private query: Querier<any, any> = new Querier(null);
    private getNameQuery: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];
    @observable private loading: boolean = false;
    @observable private detail: any = {};
    @observable private id: number|string;
    constructor(props: any) {
        super(props);
        this.id = props.match.params.id;
    }
    componentWillReceiveProps(props: any) {
        if (this.id === props.match.params.id) {
            return;
        } else {
            this.id = props.match.params.id;
            this.init();
        }
    }
    init() {
        this.query.setReq({
            url: this.props.url + '/' + this.id + '/emergencyContact',
            method: 'get',
        });
        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.detail = searchData;
        }));
        if (!this.props.name) {
            this.getNameQuery.setReq({
                url: this.props.getNameUrl + this.id,
                method: 'get',
            });
            this.disposers.push(reaction(() => {
                return (_.get(this.getNameQuery.result, 'result.data') as any) || [];
            }, searchData => {
                this.setTitle(searchData.name);
            }));
        } else {
            this.setTitle(this.props.name);
        }
    }
    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }
    setTitle(name: string) {
        this.props.data.appState.panes.map((item: any) => {
            if ('/management' + item.url === this.props.location.pathname) {
                item.title =  '紧急联系人|' + (name || '');
            }
        });
    }
    componentDidMount() {
        this.init();
    }
    render() {
        const tableColumn: any[] = [];
        (Object.keys(this.detail.header || {})).map((item: string, index: number) => {
             tableColumn.push({title: this.detail.header[item], key: item, dataIndex: item});
        });
        const table = <Table rowKey={'key'} columns={tableColumn} dataSource={this.detail.list || []} bordered pagination={false} />;
        return (
            <Title>
                <CardClass title={'紧急联系人'} content={table} />
            </Title>
        );
    }
}
export const EmergencyContact = withRouter(withAppState(EmergencyContactCom));
@observer
class ImageDataCom extends React.Component<any, any> {
    private query: Querier<any, any> = new Querier(null);
    private getNameQuery: Querier<any, any> = new Querier(null);
    private disposers: Array<() => void> = [];
    @observable private loading: boolean = false;
    @observable private detail: any = {};
    @observable private id: number|string;
    constructor(props: any) {
        super(props);
    }
    componentWillUnmount() {
        this.disposers.forEach(f => f());
        this.disposers = [];
    }
    setTitle(name: string) {
        this.props.data.appState.panes.map((item: any) => {
            if ('/management' + item.url === this.props.location.pathname) {
                item.title =  '影像资料|' + (name || '');
            }
        });
    }
    componentWillReceiveProps(props: any) {
        if (this.id === props.match.params.id) {
            return;
        } else {
            this.id = props.match.params.id;
            this.init();
        }
    }
    init() {
        this.query.setReq({
            url: this.props.url + '/' + this.id + '/imageData',
            method: 'get',
        });
        this.disposers.push(reaction(() => {
            return (_.get(this.query.result, 'result.data') as any) || [];
        }, searchData => {
            this.detail = searchData;
        }));
        if (!this.props.name) {
            this.getNameQuery.setReq({
                url: this.props.getNameUrl + this.id,
                method: 'get',
            });
            this.disposers.push(reaction(() => {
                return (_.get(this.getNameQuery.result, 'result.data') as any) || [];
            }, searchData => {
                this.setTitle(searchData.name || searchData.customer.name);
            }));
        } else {
            this.setTitle(this.props.name);
        }
    }
    componentDidMount() {
        this.init();
    }
    render() {
        const identityObj = this.detail.identity || {};
        const identityCol = Object.keys(identityObj).map((item: any, index: any) => {
            if (item === 'idcard_reverse_picture' || item === 'idcard_front_picture'  ) {
                return <Col style={{textAlign: 'center'}} key={index} span={12}><img style={{width: '400px', height: '250px'}} src={identityObj[item].value} /></Col>;
            }
            return <Col style={{marginBottom: '20px'}} key={index} span={8}>{identityObj[item].label}:{identityObj[item].value}</Col>;
        });
        const rowLength = identityCol.length / 3;
        const identity = <div>
            {
                (() => {
                    const arr = [];
                    for (let i = 0; i < rowLength; i++) {
                        arr.push(<Row key={i}>{[identityCol[i * 3], identityCol[i * 3 + 1], identityCol[i * 3 + 2]]}</Row>);
                    }
                    return arr;
                })()
            }
        </div>;
        const face_contrast = <div>
            <div style={{marginBottom: '20px'}}>人脸对比结果：<span style={{fontWeight: 700}}>{this.detail.face_contrast && this.detail.face_contrast.result.value}</span></div>
            <div><div style={{marginBottom: '20px'}}>活体验证动作照片：</div><img src={this.detail.face_contrast && this.detail.face_contrast.picture.value} /></div>
        </div>;
        return (
            <div style={{marginBottom: '20px'}}>
                <Title>
                    <CardClass title={'身份信息'} content={identity} />
                    <CardClass title={'活体检测'} content={face_contrast} />
                </Title>
            </div>
        );
    }
}
export const ImageData = withRouter(withAppState(ImageDataCom));
