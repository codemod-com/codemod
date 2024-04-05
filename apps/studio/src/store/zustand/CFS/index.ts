import { type Node } from "@babel/types";
import create from "zustand";
import type { SendMessageResponse } from "~/api/sendMessage";
import { autoGenerateCodemodPrompt } from "~/store/zustand/CFS/prompts";
import { TreeNode } from "~/types/tree";
import { getNodeById, getNodeHash, isNode } from "~/utils/tree";
import { PromptPreset } from "./prompts";

export const states = {
	VALUE: "Value",
	TYPE: "Type",
	UNSELECTED: "Unselected",
} as const;

export function isNeitherNullNorUndefined<T>(
	value: T,
	// eslint-disable-next-line @typescript-eslint/ban-types
): value is T & {} {
	return value !== null && value !== undefined;
}

export type TreeNodeSelectorState = typeof states extends Record<any, infer V>
	? V
	: never;

export const LLM_ENGINES = [
	"gpt-4",
	"claude-2.0",
	"claude-instant-1.2",
	"replit-code-v1-3b",
	"gpt-4-with-chroma",
] as const;

export type Engine = (typeof LLM_ENGINES)[number];

// @TODO move to separate slice after demo
export type AIAssistantState = Readonly<{
	loading: boolean;
	error: Error | null;
	result: SendMessageResponse | null;
	usersPrompt: string;
	codemodApplied: boolean;
	codemodHasRuntimeErrors: boolean;
	selectedPreset: PromptPreset | null;
	open: boolean;
	engine: Engine;
}>;

const AIAssistantInitialState = {
	loading: false,
	error: null,
	result: null,
	usersPrompt: autoGenerateCodemodPrompt,
	codemodApplied: false,
	codemodHasRuntimeErrors: false,
	selectedPreset: null,
	open: false,
	engine: "gpt-4" as const,
};

const ignoredKeys = ["tokens", "loc", "start", "end", "extra"];

const generatePartialAST = (
	node: Node,
	nodeSelectorTreeState: Record<string, TreeNodeSelectorState>,
): Partial<Node> | undefined => {
	const newNode: Partial<Node> = {};
	const keys = Object.keys(node);

	const nodeId = getNodeHash(node);
	keys.forEach((key) => {
		if (ignoredKeys.includes(key)) {
			return;
		}

		const child: Node | Node[] | null = (node as any)[key];

		if (!child) {
			return;
		}

		if (
			nodeSelectorTreeState[nodeId] === states.TYPE &&
			["name", "value"].includes(key)
		) {
			return;
		}

		if (Array.isArray(child)) {
			// eslint-disable-next-line no-debugger
			const mappedChild = child
				.filter(isNode)
				.filter((ch) => {
					const childId = getNodeHash(ch);
					return nodeSelectorTreeState[childId] !== states.UNSELECTED;
				})
				.map((ch) => generatePartialAST(ch, nodeSelectorTreeState));

			if (mappedChild.length) {
				(newNode as any)[key] = mappedChild;
			}
		} else if (isNode(child)) {
			const childId = getNodeHash(child);

			if (nodeSelectorTreeState[childId] === states.UNSELECTED) {
				return;
			}

			(newNode as any)[key] = generatePartialAST(child, nodeSelectorTreeState);
		} else {
			(newNode as any)[key] = child;
		}
	});

	return newNode;
};

const generateFindExpression = (
	parentNodes: TreeNode[],
	selectedNode: TreeNode | null,
	nodeSelectorTreeState: Record<string, TreeNodeSelectorState>,
): string => {
	if (!selectedNode) return "";
	let generatedOutput = parentNodes.reduce(
		(acc, node) => `${acc}.find(j.${node.label}) \n`,
		"root \n",
	);

	generatedOutput += `.find(j.${selectedNode?.label}, ${JSON.stringify(
		generatePartialAST(selectedNode.actualNode, nodeSelectorTreeState),
		null,
		2,
	)}) \n`;

	return generatedOutput;
};

export const nodeHasValues = (type: Node["type"]): boolean =>
	type === "Identifier" || type === "StringLiteral" || type === "NumberLiteral";

export const getAvailableState = (
	node: TreeNode,
	selectedNode: TreeNode,
): TreeNodeSelectorState[] => {
	const availableStates: TreeNodeSelectorState[] = [];

	const isRootNode = node.id === selectedNode.id;
	const hasNameOrValue = nodeHasValues(node.actualNode.type);

	if (hasNameOrValue) {
		availableStates.push(states.VALUE);
	}

	availableStates.push(states.TYPE);

	// root node cannot be unselected
	if (!isRootNode) {
		availableStates.push(states.UNSELECTED);
	}

	return availableStates;
};

export type CFSStateValues = {
	isOpen: boolean;
	parentNodes: TreeNode[];
	selectedNodeIds: string[];
	generatedOutput: string;
	nodeSelectorTreeState: Record<string, TreeNodeSelectorState>;
	hoveredNode: TreeNode | null;
	AIAssistant: AIAssistantState;
};
export type CFSStateSetters = {
	transitionNodeState: (selectedNode: TreeNode, node: TreeNode) => void;
	toggleSelectedNodeId: (nodeId: string) => void;
	setParentNodes: (nodes: TreeNode[]) => void;
	setNodeSelectorTreeState: (
		state: Record<string, TreeNodeSelectorState>,
	) => void;
	setNodeState: (node: TreeNode, state: TreeNodeSelectorState) => void;
	setHoveredNode: (node: TreeNode | null) => void;
	setEngine: (engine: Engine) => void;
	setIsOpen: (isOpen: boolean) => void;
};
export type CFSStateSelectors = {
	getSelectedCFS: () => TreeNode[];
	selectCFSOutput: (selectedNode: TreeNode | null) => string;
	selectNodesByState: (
		selectedNode: TreeNode | null,
		nodeState: TreeNodeSelectorState,
	) => TreeNode[];
};

export type CFSState = CFSStateValues & CFSStateSetters & CFSStateSelectors;

export const defaultState: CFSStateValues = {
	isOpen: false,
	parentNodes: [],
	selectedNodeIds: [],
	generatedOutput: "",
	nodeSelectorTreeState: {},
	hoveredNode: null,
	AIAssistant: AIAssistantInitialState,
};

export const useCFSStore = create<CFSState>((set, get) => ({
	...defaultState,
	setIsOpen: (isOpen: boolean) => set({ isOpen }),
	toggleSelectedNodeId: (nodeId: string) =>
		set((state) => {
			const idx = state.selectedNodeIds.indexOf(nodeId);
			const newSelectedNodeIds =
				idx === -1
					? [...state.selectedNodeIds, nodeId]
					: state.selectedNodeIds.filter((id) => id !== nodeId);
			return { selectedNodeIds: newSelectedNodeIds };
		}),
	setParentNodes: (nodes: TreeNode[]) => set({ parentNodes: nodes }),
	setNodeSelectorTreeState: (state: Record<string, TreeNodeSelectorState>) =>
		set({ nodeSelectorTreeState: state }),
	setNodeState: (node: TreeNode, state: TreeNodeSelectorState) =>
		set((s) => ({
			nodeSelectorTreeState: { ...s.nodeSelectorTreeState, [node.id]: state },
		})),
	transitionNodeState: (selectedNode: TreeNode, node: TreeNode) =>
		set((s) => {
			const availableStates = getAvailableState(node, selectedNode);
			const currState = s.nodeSelectorTreeState[node.id];
			const idx = availableStates.findIndex((s) => currState === s);
			const nextState =
				availableStates[(idx + 1) % availableStates.length] || "Unselected";
			return {
				nodeSelectorTreeState: {
					...s.nodeSelectorTreeState,
					[node.id]: nextState,
				},
			};
		}),
	setHoveredNode: (node: TreeNode | null) => set({ hoveredNode: node }),
	setEngine: (engine: Engine) =>
		set((state) => ({ AIAssistant: { ...state.AIAssistant, engine } })),
	getSelectedCFS: () =>
		get().parentNodes.filter((node) => get().selectedNodeIds.includes(node.id)),
	selectCFSOutput: (selectedNode: TreeNode | null) => {
		const { getSelectedCFS, nodeSelectorTreeState } = get();
		return generateFindExpression(
			getSelectedCFS(),
			selectedNode,
			nodeSelectorTreeState,
		);
	},
	selectNodesByState: (
		selectedNode: TreeNode | null,
		nodeState: TreeNodeSelectorState,
	) => {
		const { nodeSelectorTreeState } = get();
		return selectedNode
			? Object.keys(nodeSelectorTreeState)
					.filter(
						(nodeId) =>
							nodeSelectorTreeState[nodeId] === nodeState &&
							nodeId !== selectedNode.id,
					)
					.map((nodeId) => getNodeById(selectedNode, nodeId))
					.filter(isNeitherNullNorUndefined)
			: [];
	},
}));
