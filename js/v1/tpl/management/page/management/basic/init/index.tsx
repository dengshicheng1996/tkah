import { observer } from 'mobx-react';
import * as React from 'react';
import {
    Route,
    Switch,
} from 'react-router-dom';
import Title from '../../../../common/TitleComponent';
import appSet from './appSet';
import clientInfo from './clientInfo';
import contract from './contract';
import init from './init';
import product from './product';
import signature from './signature';

@observer
export default class Product extends React.Component<{}, any> {
    render() {
        return (
            <Title>
                <Switch>
                    <Route exact path='/management/basic/init' component={init} />
                    <Route exact path='/management/basic/init/product' component={product} />
                    <Route exact path='/management/basic/init/contract' component={contract} />
                    <Route exact path='/management/basic/init/appSet' component={appSet} />
                    <Route exact path='/management/basic/init/clientInfo' component={clientInfo} />
                    <Route exact path='/management/basic/init/signature' component={signature} />
                </Switch>
            </Title>
        );
    }
}
