import { useNavigate } from "solid-app-router";
import { createMemo, For } from "solid-js";
import ResizeBox from "../components/ResizeBox";

import stores from "../stores/Nodes";
import { selectedStore, setSelectedStore } from "../stores/SelectedNode";

export default function SelectPanel() {
	const navigate = useNavigate();

	return <NodeTreeView />;
}
