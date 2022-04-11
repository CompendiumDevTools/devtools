import { createSignal } from "solid-js";
import { createMutable, createStore } from "solid-js/store";

export type NodeID = string;

// Points in time for the Node's data.
// Added to the history on update.
export type NodePoint = {
	name:
		| string
		| {
				open: string;
				close: string;
		  };
	display: boolean;
	children: NodeID[];

	time: Date;
	callstack: NodeJS.CallSite[];

	state: any;
};

// Settings that never change.
// Added on register.
export type NodeOptions = {
	id: NodeID;
	serialize: boolean;
	trackHistory: boolean;
	actions: Function[];
};

export type Node = NodeOptions & {
	history: NodePoint[];
};

export type NodeCollection = {
	[id: string]: Node;
};

export default createMutable<NodeCollection>({});
