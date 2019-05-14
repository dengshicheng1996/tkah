import { Button } from 'common/antd/button';
import { Card } from 'common/antd/card';
import { Col } from 'common/antd/col';
import { Form } from 'common/antd/form';
import { Icon } from 'common/antd/icon';
import { Input } from 'common/antd/input';
import { message } from 'common/antd/message';
import { Row } from 'common/antd/row';
import { Select } from 'common/antd/select';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import Title from '../../../../common/TitleComponent';
import contract from './contract';
import product from './product';
const Option = Select.Option;
@observer
export default class Product extends React.Component<{}, any> {
    @observable private initFields: any[] = [
        {title: '产品配置', status: '', icon: '', key: '', url: '/management/basic/init/product'},
        {title: '合同签章', status: '', icon: '', key: '', url: '/management/basic/init/contract'},
        {title: '合同配置', status: '', icon: '', key: '', url: '/management/basic/init/contract'},
        {title: '客户资料', status: '', icon: '', key: '', url: '/management/basic/init/product'},
        {title: '审核授信规则', status: '', icon: '', key: '', url: '/management/basic/init/product'},
        {title: 'App配置', status: '', icon: '', key: '', url: '/management/basic/init/product'},
    ];
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <Title>
                <Switch>
                    <Route exact path='/management/basic/init/product' component={product} />
                    <Route exact path='/management/basic/init/contract' component={contract} />
                    <div>
                        {
                            this.initFields.map((item, index) => {
                                return <div key={index}>
                                            <Link to={item.url}>
                                                {/*<Icon type={item.icon} />*/}
                                                <h2>{item.title}</h2>
                                                <div>{item.status ? '未配置' : ''}</div>
                                            </Link>
                                        </div>;
                            })
                        }
                    </div>
                </Switch>
            </Title>
        );
    }

}
class CardClass extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
                <div style={{marginBottom: '20px'}}>
                    <Card
                        headStyle={{borderBottom: 'none'}}
                        title={<span style={{color: '#0099FF', borderBottom: '3px solid #0099FF', padding: '0 0px 10px 0', display: 'inline-block', width: 120}}>{this.props.title}</span>}
                        extra={this.props.topButton}
                    >
                        {
                            this.props.content
                        }
                    </Card>
                </div>
        );
    }

}
