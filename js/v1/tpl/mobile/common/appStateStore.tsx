import * as H from 'history';
import { observable } from 'mobx';
import { inject, Provider } from 'mobx-react';
import * as React from 'react';

declare const window: any;

export class AppStateStore {
    @observable appState: {
        currentUser?: {
            channelIdCode?: string,
            productId?: string,
            username?: string,
            name?: string,
            permissions?: string[],
            phone?: string,
        },
    };

    @observable pageTitle: string;

    @observable parentPageUrl: H.Location<any>;

    @observable stepInfo?: {
        stepNumber: number;
        steps: any[];
    };

    constructor() {
        this.appState = {
            currentUser: {
                permissions: ['guest'],
            },
        };

        this.pageTitle = '填写资料';

        this.stepInfo = {
            stepNumber: 0,
            steps: [],
        };
    }

}

export interface WithAppState {
    data: AppStateStore;
}

export class AppStateProvider extends React.Component<{}, {}> {
    private store: AppStateStore;
    constructor(props: any) {
        super(props);
        this.store = new AppStateStore();
    }
    render() {
        return (
            <Provider data={this.store}>
                {this.props.children}
            </Provider>
        );
    }
}

export function withAppState<P>(
    UnderlyingComponent: React.ComponentClass<P & WithAppState>
        | React.StatelessComponent<P & WithAppState>)
    : React.ComponentClass<P> {
    return inject('data')(UnderlyingComponent as any);
}
