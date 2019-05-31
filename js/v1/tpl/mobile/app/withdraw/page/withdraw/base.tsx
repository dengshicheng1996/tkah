import * as React from 'react';

export class BaseView extends React.Component<{}, {}> {

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div>{this.props.children}</div>
        );
    }

}

export const Base = BaseView;
