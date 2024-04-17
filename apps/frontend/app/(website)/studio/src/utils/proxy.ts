import { type Node, isNode } from "@babel/types";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import type { ASTNode } from "ast-types";
import type { ASTPath, Collection, JSCodeshift } from "jscodeshift";
import { print } from "recast";
import type { EventManager } from "./eventManager";
import { isNeitherNullNorUndefined } from "./isNeitherNullNorUndefined";

export type ProxifiedCollection<T> = Collection<T> & { _doSend: boolean };
export type ProxifiedPath<T> = ReturnType<Collection<T>["paths"]>[number];

const withNoSend =
	(collection: ProxifiedCollection<any>) =>
	<T>(callback: (c: ProxifiedCollection<any>) => T) => {
		const previousDoSend = collection._doSend;

		try {
			collection._doSend = false;

			return callback(collection);
		} finally {
			collection._doSend = previousDoSend;
		}
	};

const getOffsetRange = ({ start, end }: Node): OffsetRange | null => {
	if (!isNeitherNullNorUndefined(start) || !isNeitherNullNorUndefined(end)) {
		return null;
	}

	return {
		start,
		end,
	};
};

const getNodeRanges = (
	collection: Collection<any>,
): ReadonlyArray<OffsetRange> => {
	return collection
		.nodes()
		.filter(isNode)
		.map(getOffsetRange)
		.filter(isNeitherNullNorUndefined);
};

const getOffsetRangeFromMethodName = (
	originalMethodName: string,
	str: string,
): OffsetRange => {
	const regex = new RegExp(`^${originalMethodName}_(\\d+)_(\\d+)$`);

	const regExpMatchArray = regex.exec(str);

	const matchedStart = regExpMatchArray?.[1];
	const matchedEnd = regExpMatchArray?.[2];

	const start =
		matchedStart !== undefined ? Number.parseInt(matchedStart, 10) : Number.NaN;
	const end =
		matchedEnd !== undefined ? Number.parseInt(matchedEnd, 10) : Number.NaN;

	return { start, end };
};

export const buildNodeProxy = <T extends object>(node: T): T => {
	const HIDDEN_ATTRIBUTES = ["start", "end", "loc"];

	return new Proxy(node, {
		get(target, property) {
			if (
				typeof property === "string" &&
				HIDDEN_ATTRIBUTES.includes(property)
			) {
				return undefined;
			}

			const possibleNode = target[property as keyof typeof target];

			if (typeof possibleNode === "object" && possibleNode !== null) {
				return buildNodeProxy(possibleNode);
			}

			return possibleNode;
		},
		set(target, property, value) {
			if (
				typeof property === "string" &&
				HIDDEN_ATTRIBUTES.includes(property)
			) {
				return false;
			}

			target[property as keyof typeof target] = value;
			return true;
		},
		has(target, property) {
			if (
				typeof property === "string" &&
				HIDDEN_ATTRIBUTES.includes(property)
			) {
				return false;
			}

			return property in target;
		},
		deleteProperty(target, property) {
			if (
				typeof property === "string" &&
				HIDDEN_ATTRIBUTES.includes(property)
			) {
				return false;
			}

			return delete target[property as keyof typeof target];
		},
	});
};

export const proxifyPath = <T>(
	path: ReturnType<Collection<T>["paths"]>[number],
	eventManager: EventManager,
	onProxifiedPath: (proxifiedPath: ProxifiedPath<any>) => void,
): ProxifiedPath<T> => {
	const { node } = path;

	if (!isNode(node)) {
		return path;
	}

	const beforeSnippetStart = node.start ?? Number.NaN;
	const beforeSnippetEnd = node.end ?? Number.NaN;

	const proxifiedPath = new Proxy(path, {
		get(target, p, receiver) {
			if (typeof p !== "string") {
				return Reflect.get(target, p, receiver);
			}

			if (p.startsWith("replace_")) {
				const codemodSourceRange = getOffsetRangeFromMethodName("replace", p);

				return new Proxy(target.replace, {
					apply: (replaceTarget, thisArg, argArray) => {
						const codes: string[] = [];

						try {
							codes.push(print(argArray[0]).code);
						} catch (error) {
							console.error(error);
						}

						eventManager.pushEvent({
							kind: "pathReplace",
							nodeType: node.type,
							snippetBeforeRanges: [
								{
									start: beforeSnippetStart,
									end: beforeSnippetEnd,
								},
							],
							codemodSourceRange,
							timestamp: Date.now(),
							codes,
							mode: "replacement",
						});

						return Reflect.apply(replaceTarget, thisArg, argArray);
					},
				});
			}

			return Reflect.get(target, p, receiver);
		},
	});

	onProxifiedPath(proxifiedPath);

	return proxifiedPath;
};

export const proxifyCollection = <T>(
	_collection: Collection<T>,
	eventManager: EventManager,
	onProxifiedCollection: (
		proxifiedCollection: ProxifiedCollection<any>,
	) => void,
	onProxifiedPath: (proxifiedPath: ProxifiedPath<any>) => void,
): ProxifiedCollection<T> => {
	const nodeType = _collection.getTypes()[0] ?? "";

	const collection = Object.assign(_collection, {
		_doSend: true,
	});

	const proxifiedCollection = new Proxy(collection, {
		get(target, p, receiver) {
			if (typeof p !== "string") {
				return Reflect.get(target, p, receiver);
			}

			if (p.startsWith("paths_")) {
				const codemodSourceRange = getOffsetRangeFromMethodName("paths", p);

				return new Proxy(target.paths, {
					apply: (findTarget, thisArg, argArray) => {
						const astPaths: ASTPath<any>[] = Reflect.apply(
							findTarget,
							thisArg,
							argArray,
						);

						const proxifiedPaths = astPaths.map((astPath) =>
							proxifyPath(astPath, eventManager, onProxifiedPath),
						);

						const snippetBeforeRanges = proxifiedPaths
							.map(({ node }) => node)
							.filter(isNode)
							.map(getOffsetRange)
							.filter(isNeitherNullNorUndefined);

						if (thisArg._doSend) {
							eventManager.pushEvent({
								kind: "collectionPaths",
								codemodSourceRange,
								snippetBeforeRanges,
								timestamp: Date.now(),
								mode: "lookup",
							});
						}

						return proxifiedPaths;
					},
				});
			}

			if (
				p.startsWith("forEach_") ||
				p.startsWith("map_") ||
				p.startsWith("filter_")
			) {
				const methodName = p.startsWith("forEach")
					? "forEach"
					: p.startsWith("map")
					  ? "map"
					  : "filter";

				const codemodSourceRange = getOffsetRangeFromMethodName(methodName, p);

				return new Proxy(target[methodName], {
					apply: (findTarget, thisArg: ProxifiedCollection<any>, argArray) => {
						// HERE
						const nodeType = thisArg.getTypes()[0] ?? "";
						const timestamp = Date.now();

						const snippetBeforeRanges: OffsetRange[] = [];
						const codes: string[] = [];

						const index = eventManager.pushEvent({
							kind: "path",
							codemodSourceRange,
							timestamp,
							snippetBeforeRanges,
							nodeType,
							mode: "lookup",
							codes,
						});

						const totalNodeCount = thisArg.nodes().length;
						let currentNodeCount = 0;

						const increaseNodeCount = () => {
							++currentNodeCount;

							if (currentNodeCount !== totalNodeCount) {
								return;
							}

							if (thisArg._doSend) {
								eventManager.updateEvent(
									{
										kind: "path",
										codemodSourceRange,
										timestamp: Date.now(),
										snippetBeforeRanges,
										nodeType: thisArg.getTypes()[0] ?? "",
										mode: codes.length === 0 ? "lookup" : "replacement",
										codes,
									},
									index,
								);
							}
						};

						const callback: Parameters<Collection[typeof methodName]>[0] = (
							path,
							i,
							paths,
						) => {
							const proxifiedPath = proxifyPath(
								path,
								eventManager,
								onProxifiedPath,
							);
							const { node } = proxifiedPath;

							snippetBeforeRanges.push({
								start: node.start ?? Number.NaN,
								end: node.end ?? Number.NaN,
							});

							const proxiedNode = buildNodeProxy(node);
							// removeLocationProperties(node);

							const printedNodeBefore = print(proxiedNode);

							const value = argArray[0](proxifiedPath, i, paths);

							// removeLocationProperties(node);

							const printedNodeAfter = print(proxiedNode);

							if (printedNodeBefore.code !== printedNodeAfter.code) {
								codes.push(printedNodeAfter.code);
							}

							increaseNodeCount();

							return value;
						};

						const descendantCollection = Reflect.apply(
							findTarget,
							thisArg,
							argArray.length !== 1 ? argArray : [callback],
						);

						return proxifyCollection(
							descendantCollection,
							eventManager,
							onProxifiedCollection,
							onProxifiedPath,
						);
					},
				});
			}

			if (p.startsWith("some_") || p.startsWith("every_")) {
				const methodName = p.startsWith("some") ? "some" : "every";

				const codemodSourceRange = getOffsetRangeFromMethodName(methodName, p);

				return new Proxy(target[methodName], {
					apply: (findTarget, thisArg: ProxifiedCollection<any>, argArray) => {
						const nodeType = thisArg.getTypes()[0] ?? "";
						const timestamp = Date.now();

						const index = eventManager.pushEvent({
							kind: "path",
							codemodSourceRange,
							timestamp,
							snippetBeforeRanges: [],
							nodeType,
							mode: "lookup",
							codes: [],
						});

						const snippetBeforeRanges: OffsetRange[] = [];

						const totalNodeCount = thisArg.nodes().length;
						let currentNodeCount = 0;

						const increaseNodeCount = () => {
							++currentNodeCount;

							if (currentNodeCount !== totalNodeCount) {
								return;
							}

							if (thisArg._doSend) {
								eventManager.updateEvent(
									{
										kind: "path",
										codemodSourceRange,
										timestamp,
										snippetBeforeRanges,
										nodeType,
										mode: "lookup",
										codes: [],
									},
									index,
								);
							}
						};

						const callback: Parameters<Collection[typeof methodName]>[0] = (
							path,
							i,
							paths,
						) => {
							const proxifiedPath = proxifyPath(
								path,
								eventManager,
								onProxifiedPath,
							);

							const value = argArray[0](proxifiedPath, i, paths);

							increaseNodeCount();

							return value;
						};

						return Reflect.apply(
							findTarget,
							thisArg,
							argArray.length !== 1 ? argArray : [callback],
						);
					},
				});
			}

			if (
				p.startsWith("find_") ||
				p.startsWith("findVariableDeclarators_") ||
				p.startsWith("findJSXElements_")
			) {
				const methodName = p.startsWith("find_")
					? "find"
					: p.startsWith("findVariableDeclarators")
					  ? "findVariableDeclarators"
					  : "findJSXElements";

				const codemodSourceRange = getOffsetRangeFromMethodName(methodName, p);

				return new Proxy(target[methodName], {
					apply: (findTarget, thisArg, argArray) => {
						const descendantCollection: Collection<any> = Reflect.apply(
							findTarget,
							thisArg,
							argArray,
						);

						const snippetBeforeRanges =
							getNodeRanges(descendantCollection).slice();

						const nodeType = descendantCollection.getTypes()[0] ?? "";

						if (thisArg._doSend) {
							eventManager.pushEvent({
								kind: "collectionFind",
								nodeType,
								codemodSourceRange,
								snippetBeforeRanges,
								timestamp: Date.now(),
								mode: "lookup",
							});
						}

						return proxifyCollection(
							descendantCollection,
							eventManager,
							onProxifiedCollection,
							onProxifiedPath,
						);
					},
				});
			}

			if (p.startsWith("toSource_")) {
				const codemodSourceRange = getOffsetRangeFromMethodName("toSource", p);

				return new Proxy(target.toSource, {
					apply: (toSourceTarget, thisArg, argArray) => {
						const source = Reflect.apply(toSourceTarget, thisArg, argArray);

						if (thisArg._doSend) {
							eventManager.pushEvent({
								kind: "collectionToSource",
								nodeType,
								codemodSourceRange,
								timestamp: Date.now(),
								mode: "control",
							});
						}

						return source;
					},
				});
			}

			if (p.startsWith("remove_")) {
				const codemodSourceRange = getOffsetRangeFromMethodName("remove", p);

				return new Proxy(target.remove, {
					apply: (
						removeTarget,
						thisArg: ProxifiedCollection<any>,
						argArray,
					) => {
						const snippetBeforeRanges = getNodeRanges(thisArg).slice();

						if (thisArg._doSend) {
							eventManager.pushEvent({
								kind: "collectionRemove",
								nodeType,
								snippetBeforeRanges,
								codemodSourceRange,
								timestamp: Date.now(),
								mode: "removal",
							});
						}

						return withNoSend(thisArg)(() =>
							Reflect.apply(removeTarget, thisArg, argArray),
						);
					},
				});
			}

			if (p.startsWith("replaceWith_")) {
				const codemodSourceRange = getOffsetRangeFromMethodName(
					"replaceWith",
					p,
				);

				return new Proxy(target.replaceWith, {
					apply: (
						replaceWithTarget,
						thisArg: ProxifiedCollection<any>,
						argArray,
					) => {
						const snippetBeforeRanges = getNodeRanges(thisArg).slice();

						const [firstArgument] = argArray;

						if (typeof firstArgument === "string") {
							const code = firstArgument;

							const value = withNoSend(thisArg)(() =>
								Reflect.apply(replaceWithTarget, thisArg, argArray),
							);

							if (thisArg._doSend) {
								eventManager.pushEvent({
									kind: "collectionReplace",
									nodeType,
									codemodSourceRange,
									timestamp: Date.now(),
									snippetBeforeRanges,
									mode: "replacement",
									codes: [code],
								});
							}

							return value;
						}

						if (typeof firstArgument === "function") {
							const { value, codes } = withNoSend(thisArg)(() => {
								const codes: string[] = [];

								const wrappedCallback = (path: ASTPath, i: number) => {
									const node: ASTNode = firstArgument(path, i);

									const proxiedNode = buildNodeProxy(node);

									codes.push(print(proxiedNode).code);

									return node;
								};

								const value = Reflect.apply(replaceWithTarget, thisArg, [
									wrappedCallback,
								]);

								return { value, codes };
							});

							if (thisArg._doSend) {
								eventManager.pushEvent({
									kind: "collectionReplace",
									nodeType,
									codemodSourceRange,
									timestamp: Date.now(),
									snippetBeforeRanges,
									mode: "replacement",
									codes,
								});
							}

							return value;
						}

						if (typeof firstArgument === "object") {
							if (thisArg._doSend) {
								const codes = [];

								try {
									const node = buildNodeProxy(firstArgument);

									codes.push(print(node).code);
								} catch (error) {
									console.error(error);
								}

								eventManager.pushEvent({
									kind: "collectionReplace",
									nodeType,
									codemodSourceRange,
									timestamp: Date.now(),
									snippetBeforeRanges,
									mode: "replacement",
									codes,
								});
							}

							return withNoSend(thisArg)(() =>
								Reflect.apply(replaceWithTarget, thisArg, argArray),
							);
						}

						return withNoSend(thisArg)(() =>
							Reflect.apply(replaceWithTarget, thisArg, argArray),
						);
					},
				});
			}

			return Reflect.get(target, p, receiver);
		},
	});

	onProxifiedCollection(proxifiedCollection);

	return proxifiedCollection;
};

export const proxifyJSCodeshift = (
	jscodeshift: JSCodeshift,
	eventManager: EventManager,
	onProxifiedCollection: (
		proxifiedCollection: ProxifiedCollection<any>,
	) => void,
	onProxifiedPath: (proxifiedPath: ProxifiedPath<any>) => void,
): JSCodeshift => {
	return new Proxy(jscodeshift, {
		apply: (target, thisArg, argArray) => {
			if (argArray.length === 4 && typeof argArray[0] === "string") {
				eventManager.pushEvent({
					kind: "jscodeshiftApplyString",
					codemodSourceRange: {
						start: Number(argArray[2]),
						end: Number(argArray[3]),
					},
					timestamp: Date.now(),
					mode: "control",
				});
			}

			const collection = Reflect.apply(target, thisArg, argArray);

			return proxifyCollection(
				collection,
				eventManager,
				onProxifiedCollection,
				onProxifiedPath,
			);
		},
	});
};
