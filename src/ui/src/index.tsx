/// <reference types="chrome" />

import { render } from "solid-js/web";
import { Router } from "solid-app-router";
import App from "./app";

import "./index.css";

import Nodes, { NodeID, NodeOptions, NodePoint } from "./stores/Nodes";
// import deepFreeze from "./utils/";
import { selectedStore, setSelectedStore } from "./stores/SelectedNode";
import ResolvedStack from "./utils/ResolvedStack";
import GlobalHistory from "./stores/GlobalHistory";

// Fix wrong starting URL.
window.history.replaceState({}, "", "/");

type BaseNodeRequest = {
	source: string;
};

type RegisterNodeRequest = BaseNodeRequest & {
	type: "REGISTER_NODE";
	options: NodeOptions;
	point: NodePoint;
};

type UpdateNodeRequest = BaseNodeRequest & {
	type: "UPDATE_NODE";
	point: NodePoint;
	id: NodeID;
};

type UnregisterNodeRequest = BaseNodeRequest & {
	type: "UNREGISTER_NODE";
	id: NodeID;
};

type ResetRequest = BaseNodeRequest & { type: "RESET" };

type AnyRequest =
	| RegisterNodeRequest
	| UpdateNodeRequest
	| UnregisterNodeRequest
	| ResetRequest;

// Create the devtools panel.
chrome.devtools.panels.create(
	"Compendium",
	null,
	"/ui/index.html",
	function (panel) {
		const tabID = chrome.devtools.inspectedWindow.tabId;

		chrome.runtime.onMessage.addListener(function (
			request: AnyRequest,
			sender,
			sendResponse
		) {
			if (
				sender.tab.id === tabID &&
				request.source === "compendium-devtools-extension"
			) {
				switch (request.type) {
					case "RESET":
						window.location.reload();
						return;
					case "REGISTER_NODE":
						// This is *really* for resetting stores when they are recreated.
						// So... Reset the history.

						console.log("Registering node", request);

						// Set up the node in the Nodes store.
						Nodes[request.options.id] = {
							...request.options,
							history: [request.point],
						};

						// Get all the nodes that currently exist and add them to the global history.
						GlobalHistory.push({
							...GlobalHistory[GlobalHistory.length - 1],
							[request.options.id]: 0,
						});
						return;
					case "UPDATE_NODE":
						console.log("Updating node", request);
						Nodes[request.id].history.push(request.point);

						// Add one to the history index in the global history.
						const currentHistory = GlobalHistory[GlobalHistory.length - 1];
						GlobalHistory.push({
							...currentHistory,
							[request.id]: currentHistory.id + 1,
						});

						return;
					case "UNREGISTER_NODE":
						console.log("Unregistering node", request);
						// Remove the node from the global history ONLY.
						// The node should be kept in the Nodes store because it can be referenced by previous points in the global history.
						// TODO: Optimze this, I'm rushing.
						GlobalHistory.push(
							Object.fromEntries(
								Object.entries(GlobalHistory[GlobalHistory.length - 1]).filter(
									([id]) => id !== request.id
								)
							)
						);

						return;
				}
			}
		});
	}
);

render(
	() => (
		<Router>
			<App />
		</Router>
	),
	document.getElementById("root") as HTMLElement
);
