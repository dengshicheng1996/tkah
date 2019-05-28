import * as React from 'react';
import {
    Link,
    Route,
    Switch,
} from 'react-router-dom';
import detail from './detail';
import list from './list';

export default class Product extends React.Component<{}, any> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <Switch>
                <Route exact path='/management/custorm/list/:id' component={detail} />
                <Route component={list}  />
            </Switch>
        );
    }
}
