import { Component, For } from "solid-js";
import ResizeBox from "./ResizeBox";
import { Node, NodeCollection, NodeID, NodePoint } from "../stores/Nodes";

import GlobalHistory from "../stores/GlobalHistory";
import Nodes from "../stores/Nodes";

const NodeTreeView: Component<{
	globalHistoryIndex: number;
}> = (props) => {
	if (props.globalHistoryIndex < 0) {
		return "Waiting for nodes to be registered...";
	}

	const globalNodePoints = () => {
		let availableGlobalNodePoints: { [id: NodeID]: NodePoint } = {};
		for (const [nodeID, nodeIndex] of Object.entries(
			GlobalHistory[props.globalHistoryIndex]
		)) {
			availableGlobalNodePoints[nodeID] = Nodes[nodeID].history[nodeIndex];
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

	return <NodeTree nodes={rootNodes()} />;
};

export default NodeTreeView;

export const NodeTree: Component<{ nodes: NodePoint[] }> = (props) => {
	return (
		<>
			<For each={props.nodes}>{(node) => <NodeTreeItem node={node} />}</For>
		</>
	);
};

export const NodeTreeItem: Component<{ node: NodePoint }> = (props) => {
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

export const NodeInspector: Component<{ node: NodePoint }> = (props) => {
	return <div>NodeInspector</div>;
};
