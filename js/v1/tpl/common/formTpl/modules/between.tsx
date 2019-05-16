import { Input } from 'common/antd/input';
import { regular } from 'common/regular';
import * as _ from 'lodash';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

const InputGroup = Input.Group;

interface BetweenProps {
    value?: any;
    form?: any;
    onChange?: any;
    placeholder?: string;
}

@observer
export class Between extends React.Component<BetweenProps, {}> {
    constructor(props: Readonly<BetweenProps>) {
        super(props);
    }

    render() {
        return (
            <InputGroup compact>
                <Input style={{ width: '40%', textAlign: 'center' }}
                    onChange={(e) => {
                        this.props.onChange([e.target.value, this.props.value[1]]);
                    }}
                    defaultValue={this.props.value[0]}
                    placeholder={this.props.placeholder[0]} />
                <Input
                    style={{
                        width: '20%',
                        borderRight: 'none',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        backgroundColor: '#fff',
                    }}
                    placeholder='~'
                    disabled
                />
                <Input style={{ width: '40%', textAlign: 'center' }}
                    onChange={(e) => {
                        this.props.onChange([this.props.value[0], e.target.value]);
                    }}
                    defaultValue={this.props.value[1]}
                    placeholder={this.props.placeholder[1]} />
            </InputGroup>
        );
    }
}
