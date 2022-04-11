// Points in time for the Node's data.

import { createMutable } from "solid-js/store";
import { NodeID } from "./Nodes";

export type GlobalHistory = {
	id: NodeID;
	historyIndex: number;
}[][];

export default createMutable<GlobalHistory>([]);
