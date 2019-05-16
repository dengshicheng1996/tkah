import { AntTreeNodeProps, TreeProps } from 'antd/lib/tree/Tree';
import { Tree } from 'common/antd/tree';
import * as _ from 'lodash';
import * as React from 'react';
import { OptionType } from '../baseForm';

interface TreeCProps {
    value?: any;
    form?: any;
    onChange?: any;
    treeProps?: TreeProps;
    options?: OptionType[];
}

export class TreeC extends React.Component<TreeCProps, {}> {
    constructor(props: Readonly<TreeCProps>) {
        super(props);
    }

    render() {
        return (
            <Tree {...this.props.treeProps}
                onCheck={(checkedKeys) => { this.props.onChange(checkedKeys); }}
                checkedKeys={this.props.value}>{this.renderTreeNodes(this.props.options)}</Tree>
        );
    }

    private renderTreeNodes = (data: OptionType[]): AntTreeNodeProps => {
        return data.map((r) => {
            if (r.children) {
                return (
                    <Tree.TreeNode title={r.title} key={r.key} dataRef={r}>
                        {this.renderTreeNodes(r.children)}
                    </Tree.TreeNode>
                );
            }
            return <Tree.TreeNode {...r} />;
        });
    }
}
