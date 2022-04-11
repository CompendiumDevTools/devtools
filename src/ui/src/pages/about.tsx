import { Component, createEffect, createMemo, For, Index, Suspense } from "solid-js";
import { Link, useData } from "solid-app-router";

import pkg from "../../package.json";

const dependencies = () => Object.entries(pkg.dependencies);

export default function AboutPanel() {
	return (
		<section class="p-4 pt-2">
			<h1 class="text-2xl font-bold">About</h1>

			<p>
				<Link class="underline underline-[#cfd0d0]" href="https://github.com/CompendiumDevTools/" target="_blank">
					Compendium DevTools
				</Link>{" "}
				is an inspector for anything you want to connect.
			</p>

			<h1 class="text-2xl font-bold">Dependencies</h1>

			<For each={dependencies()}>
				{(dep) => {
					const name = createMemo(() => dep[0]);
					const version = createMemo(() => dep[1].slice(1));
					return (
						<p>
							<Link class="underline underline-[#cfd0d0]" href={`https://www.npmjs.com/package/${name()}`} target="_blank">
								{name()}
							</Link>{" "}
							<Link class="underline underline-[#cfd0d0]" href={`https://www.npmjs.com/package/${name()}/v/${version()}`} target="_blank">
								v{version()}
							</Link>
						</p>
					);
				}}
			</For>
		</section>
	);
}
