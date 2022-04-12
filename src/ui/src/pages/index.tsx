import { useNavigate } from "solid-app-router";
import { createEffect, createMemo, For } from "solid-js";
import NodeTreeView from "../components/NodeTreeView";
import ResizeBox from "../components/ResizeBox";
import GlobalHistory from "../stores/GlobalHistory";

import stores from "../stores/Nodes";
import { selectedStore, setSelectedStore } from "../stores/SelectedNode";

export default function SelectPanel() {
	const navigate = useNavigate();

	createEffect(() => {
		console.log(GlobalHistory.length);
	});

	return (
		<>
			<NodeTreeView globalHistoryIndex={GlobalHistory.length - 1} />
		</>
	);
}
