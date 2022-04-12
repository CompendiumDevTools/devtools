// Points in time for the Node's data.

import { createMutable } from "solid-js/store";
import { NodeID } from "./Nodes";

// Each history entry is an ID and the index of the point in history it was at when this entry was created.
export type GlobalHistory = {
	[id: NodeID]: number;
}[];

export default createMutable<GlobalHistory>([]);
