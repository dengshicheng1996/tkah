import { Radium } from 'common/radium';
import * as React from 'react';

/**
 * scopeSelector 格式必须 site 开头  例如：[`${site}`, `${site}.${app}`, `${site}.${app}.xxx`]
 */
interface Props {
    rules: React.CSSProperties | any;
    scopeSelector: string[];
}

const Style: any = Radium.Style;

@Radium
export class RadiumStyle extends React.Component<Props, {}> {
    render() {
        return (
            <div>
                {
                    this.props.scopeSelector ?
                        this.props.scopeSelector.length === 0 ?
                            <Style rules={this.props.rules} />
                            :
                            (this.props.scopeSelector || []).map((r, i) => {
                                return <Style key={i} scopeSelector={r} rules={this.props.rules} />;
                            }) : null
                }
                {this.props.children}
            </div>
        );
    }
}
