/// <reference types="chrome" />

import { render } from "solid-js/web";
import { Router } from "solid-app-router";
import App from "./app";

import "./index.css";

import Nodes from "./stores/Nodes";
// import deepFreeze from "./utils/";
import { selectedStore, setSelectedStore } from "./stores/SelectedNode";
import ResolvedStack from "./utils/ResolvedStack";

// Fix wrong starting URL.
window.history.replaceState({}, "", "/");

// Create the devtools panel.
chrome.devtools.panels.create(
	"Compendium",
	null,
	"/ui/index.html",
	function (panel) {
		const tabID = chrome.devtools.inspectedWindow.tabId;

		chrome.runtime.onMessage.addListener(function (
			request: {
				id: string;
				type: string;
				name: string;
				source: string;
				state: TrackedStore;
				stack: ResolvedStack;
				actions: string[];
			},
			sender,
			sendResponse
		) {
			if (
				sender.tab.id === tabID &&
				request.source === "compendium-devtools-extension"
			) {
				switch (request.type) {
					case "REGISTER_STORE":
						// This is *really* for resetting stores when they are recreated.
						// So... Reset the history.
						Nodes[request.id] = {
							history: [
								{
									name: "§INIT§",
									time: new Date(),
									data: request.state,
									actions: request.actions,
								},
							],
						};
						return Nodes;
					case "UPDATE_STORE":
						// If the store doesn't exist, create it.
						// TODO: Show a warning if the store hasn't been created when calling this. That means it hasn't done INIT which could cause problems with hot module reloaders.
						const store: TrackedStore = Nodes[request.id];
						if (store == null) {
							// TODO: Request all data from content.
							console.warn(
								`[Compendium DevTools] Store "${request.id}" updated before creation.`
							);
							return Nodes;
						}
						store.history.push({
							name: request.name,
							time: new Date(),
							data: request.state,
							actions: request.actions,
						});
						return Nodes;
					case "DESTROY_STORE":
						delete Nodes[request.id];
						if (selectedStore() === request.id) {
							window.history.pushState({}, "", "/");
							setSelectedStore(null);
						}
						return Nodes;
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
