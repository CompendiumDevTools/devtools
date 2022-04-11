import {
	Accessor,
	Component,
	createEffect,
	createMemo,
	createSignal,
	For,
	Index,
	JSX,
	Match,
	Switch,
	untrack,
} from "solid-js";
import { createStore } from "solid-js/store";
import get from "../utils/get";
import set from "../utils/set";
import symbolJoin from "../utils/symbolJoin";
import walkTree from "../utils/walkTree";

import styles from "./ObjectTree.module.css";

type TreeLevelData = {
	[id: string]: {
		[key: string]: {
			expanded: Accessor<boolean>;
			setExpanded: (expanded: boolean) => void;
		};
	};
};

const levelData: TreeLevelData = {};

export const TreeIndent: Component<{
	color?: string;
}> = (props) => {
	return (
		<div class={styles.indent} style={{ "border-color": props.color }}>
			{props.children}
		</div>
	);
};

export const TreeItemKey: Component<{
	root: boolean;
	key: string;
	onMouseDown?: JSX.DOMAttributes<HTMLSpanElement>["onMouseDown"];
}> = (props) => {
	return (
		<>
			{!props.root ? (
				<>
					<span class={styles.key} onMouseDown={props.onMouseDown}>
						{props.key}
						{": "}
					</span>
				</>
			) : null}
		</>
	);
};

export const TreeItemPrimitive: Component<{
	root: boolean;
	key: string;
	value: any;
}> = (props) => {
	return (
		<>
			<TreeItemKey key={props.key} root={props.root} />
			<Switch
				fallback={
					<>
						<span style={{ color: "hsl(252deg 100% 75%)" }}>
							{props.value.toString()}
						</span>
					</>
				}
			>
				{/* STRING */}
				<Match when={typeof props.value === "string"}>
					<span
						style={{ color: "rgb(242, 139, 84)" }}
					>{`"${props.value}"`}</span>
				</Match>

				{/* DATE */}
				<Match when={props.value instanceof Date}>
					<span style={{ color: "rgb(242, 139, 84)" }}>
						{props.value.toISOString()}
					</span>
				</Match>
			</Switch>
		</>
	);
};

export const TreeItemObject: Component<{
	id: string;
	path: string[];
	value: any;
	root: boolean;
}> = (props) => {
	const key = () => props.path[props.path.length - 1];
	const stringPath = () => props.path.join(".");

	// Get or create the level data for this item's path.
	let expanded, setExpanded;
	if (Array.isArray(props.value) || typeof props.value === "object") {
		levelData[props.id] ??= {};
		if (levelData[props.id][stringPath()] == null) {
			const [e, sE] = createSignal(props.root);
			levelData[props.id][stringPath()] = {
				expanded: e,
				setExpanded: sE,
			};
			expanded = e;
			setExpanded = sE;
		} else {
			expanded = levelData[props.id][stringPath()].expanded;
			setExpanded = levelData[props.id][stringPath()].setExpanded;
		}
	}

	const serializedData = () => props.value?.$$SERIALIZED_TYPE$$;

	const toggleExpanded = (e) => {
		if (e.button === 0) {
			setExpanded(!expanded());
		}
	};

	return (
		<>
			<Switch>
				{/* SERIALIZED PRIMITIVE */}
				<Match
					when={serializedData() && typeof serializedData().value === "string"}
				>
					<TreeItemKey key={key()} root={props.root} />
					<span style={{ color: serializedData().color }}>
						{serializedData().value}
					</span>
				</Match>

				{/* SERIALIZED ARRAY-LIKE */}
				<Match when={serializedData() && Array.isArray(serializedData().value)}>
					<span class={styles.expandable} onMouseDown={toggleExpanded}>
						<TreeItemKey key={key()} root={props.root} />
						<span style={{ color: serializedData().color }}>
							{`${serializedData().type} `}{" "}
						</span>
						{`[${!expanded() ? "...]" : ""}`}
					</span>
					{expanded() ? (
						<>
							<TreeIndent color={serializedData().color}>
								<TreeLevel
									id={props.id}
									object={serializedData().value}
									path={props.path}
									root={false}
								/>
							</TreeIndent>
							<span class={`${styles.expandable}`} onMouseDown={toggleExpanded}>
								{"]"}
							</span>
						</>
					) : null}
				</Match>

				{/* SERIALIZED OBJECT-LIKE */}
				<Match
					when={serializedData() && typeof serializedData().value === "object"}
				>
					<span class={styles.expandable} onMouseDown={toggleExpanded}>
						<TreeItemKey key={key()} root={props.root} />
						<span style={{ color: serializedData().color }}>
							{`${serializedData().type} `}{" "}
						</span>
						{`{${!expanded() ? "...}" : ""}`}
					</span>
					{expanded() ? (
						<>
							<TreeIndent color={serializedData().color}>
								<TreeLevel
									id={props.id}
									object={serializedData().value}
									path={props.path}
									root={false}
								/>
							</TreeIndent>
							<span class={`${styles.expandable}`} onMouseDown={toggleExpanded}>
								{"}"}
							</span>
						</>
					) : null}
				</Match>

				{/* ARRAY */}
				<Match when={Array.isArray(props.value)}>
					<span class={`${styles.expandable}`} onMouseDown={toggleExpanded}>
						<TreeItemKey key={key()} root={props.root} />
						<span class={styles.typeName}>
							{`(${props.value.length.toLocaleString()}) `}
						</span>
						{`[${!expanded() ? "...]" : ""}`}
					</span>
					{expanded() ? (
						<>
							<TreeIndent>
								<TreeLevel
									id={props.id}
									object={props.value}
									path={props.path}
									root={false}
								/>
							</TreeIndent>
							<span class={`${styles.expandable}`} onMouseDown={toggleExpanded}>
								{"]"}
							</span>
						</>
					) : null}
				</Match>

				{/* THIS SHOULD BE LAST */}
				{/* OBJECT */}
				<Match when={typeof props.value === "object"}>
					<span class={styles.expandable} onMouseDown={toggleExpanded}>
						<TreeItemKey key={key()} root={props.root} />
						<span class={styles.typeName}>
							{`(${Object.keys(props.value).length.toLocaleString()}) `}
						</span>
						{`{${!expanded() ? "...}" : ""}`}
					</span>
					{expanded() ? (
						<>
							<TreeIndent>
								<TreeLevel
									id={props.id}
									object={props.value}
									path={props.path}
									root={false}
								/>
							</TreeIndent>
							<span class={`${styles.expandable}`} onMouseDown={toggleExpanded}>
								{"}"}
							</span>
						</>
					) : null}
				</Match>
			</Switch>
		</>
	);
};

export const TreeItem: Component<{
	id: string;
	path: string[];
	value: any;
	root: boolean;
}> = (props) => {
	const key = () => props.path[props.path.length - 1];

	return (
		<>
			{typeof props.value !== "object" ? (
				<TreeItemPrimitive key={key()} value={props.value} root={props.root} />
			) : (
				<TreeItemObject
					id={props.id}
					path={props.path}
					value={props.value}
					root={props.root}
				/>
			)}
		</>
	);
};

// const TreeBase: Component = (props) => {};
// export default TreeBase;

const TreeLevel: Component<{
	id: string;
	object: object | any[];
	path?: string[];
	root?: boolean;
}> = (props) => {
	const path = createMemo(() =>
		props.root ? ["this", ...(props.path ?? [])] : props.path
	);
	const isArray = () => Array.isArray(props.object);
	const nodes = createMemo(() =>
		Array.isArray(props.object) ? props.object : Object.entries(props.object)
	);

	return (
		<div class={styles.treeBase}>
			{props.root ? (
				<TreeItem
					id={props.id}
					path={path()}
					value={props.object}
					root={props.root}
				/>
			) : (
				<Index
					each={nodes()}
					fallback={
						<span class={styles.key}>Were you expecting something?</span>
					}
				>
					{(item, i) => {
						return (
							<div class={styles.treeKey}>
								<TreeItem
									id={props.id}
									path={[...path(), isArray() ? i : item()[0]]}
									value={isArray() ? item() : item()[1]}
									root={props.root}
								/>
							</div>
						);
					}}
				</Index>
			)}
		</div>
	);
};
export default TreeLevel;
