import * as React from 'react';

export class BaseView extends React.Component<{}, {}> {

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div>
                base 页面
                {this.props.children}
            </div>
        );
    }

}

export const Base = BaseView;
