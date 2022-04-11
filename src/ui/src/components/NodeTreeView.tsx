import { Component, For } from "solid-js";
import ResizeBox from "./ResizeBox";
import { Node, NodeCollection, NodeID, NodePoint } from "../stores/Nodes";

import GlobalHistory from "../stores/GlobalHistory";
import Nodes from "../stores/Nodes";

const NodeTreeView: Component<{
	globalHistoryIndex: number;
}> = (props) => {
	const globalNodePoints = () => {
		let availableGlobalNodePoints: { [id: NodeID]: NodePoint } = {};
		for (const nodeIndex of GlobalHistory[props.globalHistoryIndex]) {
			availableGlobalNodePoints[nodeIndex.id] =
				Nodes[nodeIndex.id].history[nodeIndex.historyIndex];
		}
		return availableGlobalNodePoints;
	};

	const rootNodes: () => NodePoint[] = () => {
		const confirmedChildren = new Set();
		const rootNodes = [];

		for (const nodePoint of Object.values(globalNodePoints)) {
			for (const childID of nodePoint.children) {
				confirmedChildren.add(childID);
			}
		}

		for (const nodeID of Object.keys(Nodes)) {
			if (!confirmedChildren.has(nodeID)) {
				rootNodes.push(globalNodePoints()[nodeID]);
			}
		}

		return rootNodes;
	};

	return (
		<ResizeBox direction="horizontal" left={100} right={100}>
			<NodeTree nodes={rootNodes()} />
			<NodeInspector />
		</ResizeBox>
	);
};

export default NodeTreeView;

export const NodeTree: Component<{ nodes: NodePoint[] }> = (props) => {
	return (
		<>
			<For each={props.nodes}>{(node) => <NodeTreeItem node={node} />}</For>
		</>
	);
};

const NodeTreeItem: Component<{ node: NodePoint }> = (props) => {
	const currentName = () => props.node.name;
	return (
		<span>
			{typeof currentName() === "string"
				? currentName()
				: // @ts-ignore
				  currentName().open}
		</span>
	);
};

export function NodeInspector() {
	return <div>NodeInspector</div>;
}
