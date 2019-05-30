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

    @observable stepInfo?: {
        repeat: number;
        stepNumber: number;
        steps: any[];
    };

    @observable moduleInfo?: {
        repeat: number;
        title?: string;
        moduleNumber: number;
        modules: any[];
    };

    constructor() {
        this.appState = {
            currentUser: {
                permissions: ['guest'],
            },
        };

        this.stepInfo = {
            repeat: 0,
            stepNumber: 0,
            steps: [],
        };

        this.moduleInfo = {
            repeat: 0,
            moduleNumber: 0,
            modules: [],
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
