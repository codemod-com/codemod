// /* eslint-disable no-plusplus */
// /* eslint-disable no-param-reassign */
// import { type Node } from "@babel/types";
// import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
// import { type SendMessageResponse } from "~/api/sendMessage";
// import { type TreeNode } from "~/components/Tree";
// import type { RootState } from "~/store";
// import { getNodeById, getNodeHash, isNode } from "~/utils/tree";
// import { type PromptPreset, autoGenerateCodemodPrompt } from "./prompts";
//
// const SLICE_KEY = "CFS";
//
// const states = {
// 	VALUE: "Value",
// 	TYPE: "Type",
// 	UNSELECTED: "Unselected",
// } as const;
//
// function isNeitherNullNorUndefined<T>(
// 	value: T,
// 	// eslint-disable-next-line @typescript-eslint/ban-types
// ): value is T & {} {
// 	return value !== null && value !== undefined;
// }
//
// type TreeNodeSelectorState = typeof states extends Record<any, infer V>
// 	? V
// 	: never;
//
// const ENGINES = [
// 	"gpt-4",
// 	"claude-2.0",
// 	"claude-instant-1.2",
// 	"replit-code-v1-3b",
// 	"gpt-4-with-chroma",
// ] as const;
//
// type Engine = (typeof ENGINES)[number];
//
// // @TODO move to separate slice after demo
// type AIAssistantState = Readonly<{
// 	loading: boolean;
// 	error: Error | null;
// 	result: SendMessageResponse | null;
// 	usersPrompt: string;
// 	codemodApplied: boolean;
// 	codemodHasRuntimeErrors: boolean;
// 	selectedPreset: PromptPreset | null;
// 	open: boolean;
// 	engine: Engine;
// }>;
//
// type CFSState = {
// 	isOpen: boolean;
// 	parentNodes: TreeNode[];
// 	selectedNodeIds: string[];
// 	generatedOutput: string;
// 	nodeSelectorTreeState: Record<string, TreeNodeSelectorState>;
// 	hoveredNode: TreeNode | null;
// 	AIAssistant: AIAssistantState;
// };
//
// const AIAssistantInitialState = {
// 	loading: false,
// 	error: null,
// 	result: null,
// 	usersPrompt: autoGenerateCodemodPrompt,
// 	codemodApplied: false,
// 	codemodHasRuntimeErrors: false,
// 	selectedPreset: null,
// 	open: false,
// 	engine: "gpt-4" as const,
// };
//
// const defaultState: CFSState = {
// 	isOpen: false,
// 	parentNodes: [],
// 	selectedNodeIds: [],
// 	generatedOutput: "",
// 	nodeSelectorTreeState: {},
// 	hoveredNode: null,
// 	AIAssistant: AIAssistantInitialState,
// };
//
// const ignoredKeys = ["tokens", "loc", "start", "end", "extra"];
//
// const generatePartialAST = (
// 	node: Node,
// 	nodeSelectorTreeState: Record<string, TreeNodeSelectorState>,
// ): Partial<Node> | undefined => {
// 	const newNode: Partial<Node> = {};
// 	const keys = Object.keys(node);
//
// 	const nodeId = getNodeHash(node);
// 	keys.forEach((key) => {
// 		if (ignoredKeys.includes(key)) {
// 			return;
// 		}
//
// 		const child: Node | Node[] | null = (node as any)[key];
//
// 		if (!child) {
// 			return;
// 		}
//
// 		if (
// 			nodeSelectorTreeState[nodeId] === states.TYPE &&
// 			["name", "value"].includes(key)
// 		) {
// 			return;
// 		}
//
// 		if (Array.isArray(child)) {
// 			// eslint-disable-next-line no-debugger
// 			const mappedChild = child
// 				.filter(isNode)
// 				.filter((ch) => {
// 					const childId = getNodeHash(ch);
// 					return nodeSelectorTreeState[childId] !== states.UNSELECTED;
// 				})
// 				.map((ch) => generatePartialAST(ch, nodeSelectorTreeState));
//
// 			if (mappedChild.length) {
// 				(newNode as any)[key] = mappedChild;
// 			}
// 		} else if (isNode(child)) {
// 			const childId = getNodeHash(child);
//
// 			if (nodeSelectorTreeState[childId] === states.UNSELECTED) {
// 				return;
// 			}
//
// 			(newNode as any)[key] = generatePartialAST(child, nodeSelectorTreeState);
// 		} else {
// 			(newNode as any)[key] = child;
// 		}
// 	});
//
// 	return newNode;
// };
//
// const generateFindExpression = (
// 	parentNodes: TreeNode[],
// 	selectedNode: TreeNode,
// 	nodeSelectorTreeState: Record<string, TreeNodeSelectorState>,
// ): string => {
// 	let generatedOutput = parentNodes.reduce(
// 		(acc, node) => `${acc}.find(j.${node.label}) \n`,
// 		"root \n",
// 	);
//
// 	generatedOutput += `.find(j.${selectedNode?.label}, ${JSON.stringify(
// 		generatePartialAST(selectedNode.actualNode, nodeSelectorTreeState),
// 		null,
// 		2,
// 	)}) \n`;
//
// 	return generatedOutput;
// };
//
// const getAvailableState = (
// 	node: TreeNode,
// 	selectedNode: TreeNode,
// ): TreeNodeSelectorState[] => {
// 	const availableStates: TreeNodeSelectorState[] = [];
//
// 	const isRootNode = node.id === selectedNode.id;
// 	const hasNameOrValue = nodeHasValues(node.actualNode.type);
//
// 	if (hasNameOrValue) {
// 		availableStates.push(states.VALUE);
// 	}
//
// 	availableStates.push(states.TYPE);
//
// 	// root node cannot be unselected
// 	if (!isRootNode) {
// 		availableStates.push(states.UNSELECTED);
// 	}
//
// 	return availableStates;
// };
//
// const CFSSlice = createSlice({
// 	name: SLICE_KEY,
// 	initialState: defaultState,
// 	reducers: {
// 		setIsOpen(state, action: PayloadAction<boolean>) {
// 			state.isOpen = action.payload;
// 		},
// 		toggleSelectedNodeId(state, action: PayloadAction<string>) {
// 			const nodeId = action.payload;
// 			const idx = state.selectedNodeIds.indexOf(nodeId);
//
// 			if (idx === -1) {
// 				state.selectedNodeIds.push(nodeId);
// 			} else {
// 				state.selectedNodeIds.splice(idx, 1);
// 			}
// 		},
// 		setParentNodes(state, action: PayloadAction<TreeNode[]>) {
// 			state.parentNodes = action.payload;
// 		},
// 		setNodeSelectorTreeState(
// 			state,
// 			action: PayloadAction<Record<string, TreeNodeSelectorState>>,
// 		) {
// 			state.nodeSelectorTreeState = action.payload;
// 		},
// 		setNodeState(
// 			state,
// 			action: PayloadAction<{
// 				node: TreeNode;
// 				state: TreeNodeSelectorState;
// 			}>,
// 		) {
// 			const { node, state: nodeState } = action.payload;
// 			state.nodeSelectorTreeState[node.id] = nodeState;
// 		},
// 		transitionNodeState(
// 			state,
// 			action: PayloadAction<{
// 				selectedNode: TreeNode;
// 				node: TreeNode;
// 			}>,
// 		) {
// 			const { selectedNode, node } = action.payload;
// 			const availableStates = getAvailableState(node, selectedNode);
// 			const currState = state.nodeSelectorTreeState[node.id];
//
// 			const idx = availableStates.findIndex((s) => currState === s);
//
// 			const nextState = availableStates[(idx + 1) % availableStates.length];
// 			if (!nextState) {
// 				return;
// 			}
//
// 			state.nodeSelectorTreeState[node.id] = nextState;
// 		},
// 		setHoveredNode(state, action: PayloadAction<TreeNode | null>) {
// 			state.hoveredNode = action.payload;
// 		},
// 		setEngine(state, action: PayloadAction<Engine>) {
// 			state.AIAssistant.engine = action.payload;
// 		},
// 	},
// });
//
// const {
// 	setIsOpen,
// 	toggleSelectedNodeId,
// 	setParentNodes,
// 	setNodeSelectorTreeState,
// 	setNodeState,
// 	transitionNodeState,
// 	setHoveredNode,
// 	setEngine,
// } = CFSSlice.actions;
//
// const selectCFS = (state: RootState) => {
// 	const stateSlice = state[SLICE_KEY];
//
// 	return {
// 		...stateSlice,
// 		selectedNodes: stateSlice.parentNodes.filter((node) =>
// 			stateSlice.selectedNodeIds.includes(node.id),
// 		),
// 	};
// };
//
// const selectEngine = (state: RootState) => state.CFS.AIAssistant.engine;
//
// const selectCFSOutput =
// 	(selectedNode: TreeNode | null) =>
// 	(state: RootState): string => {
// 		const { selectedNodes, nodeSelectorTreeState } = selectCFS(state);
//
// 		if (!selectedNode) {
// 			return "";
// 		}
//
// 		return generateFindExpression(
// 			selectedNodes,
// 			selectedNode,
// 			nodeSelectorTreeState,
// 		);
// 	};
//
// const selectNodesByState =
// 	(selectedNode: TreeNode | null, nodeState: TreeNodeSelectorState) =>
// 	(state: RootState) => {
// 		const { nodeSelectorTreeState } = selectCFS(state);
//
// 		return selectedNode
// 			? Object.keys(nodeSelectorTreeState)
// 					.filter(
// 						(nodeId) =>
// 							nodeSelectorTreeState[nodeId] === nodeState &&
// 							// filter out root node
// 							nodeId !== selectedNode.id,
// 					)
// 					.map((nodeId) => getNodeById(selectedNode, nodeId))
// 					.filter(isNeitherNullNorUndefined)
// 			: [];
// 	};
//
// const nodeHasValues = (type: Node["type"]): boolean =>
// 	type === "Identifier" || type === "StringLiteral" || type === "NumberLiteral";
//
// export {
// 	nodeHasValues,
// 	setIsOpen,
// 	toggleSelectedNodeId,
// 	setParentNodes,
// 	setNodeSelectorTreeState,
// 	setNodeState,
// 	setEngine,
// 	selectCFS,
// 	selectCFSOutput,
// 	selectNodesByState,
// 	getAvailableState,
// 	selectEngine,
// 	transitionNodeState,
// 	setHoveredNode,
// 	states,
// 	SLICE_KEY,
// 	ENGINES,
// };
//
// export type { TreeNodeSelectorState, PromptPreset, Engine };
//
// export default CFSSlice.reducer;
