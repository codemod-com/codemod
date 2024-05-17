import { type Node, isNode } from "@babel/types";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import type { ASTNode } from "ast-types";
import type { ASTPath, Collection, JSCodeshift } from "jscodeshift";
import { print } from "recast";
import type { EventManager } from "./eventManager";
import { isNeitherNullNorUndefined } from "./isNeitherNullNorUndefined";

export type ProxifiedCollection<T> = Collection<T> & { _doSend: boolean };
export type ProxifiedPath<T> = ReturnType<Collection<T>["paths"]>[number];

let withNoSend =
  (collection: ProxifiedCollection<any>) =>
  <T>(callback: (c: ProxifiedCollection<any>) => T) => {
    let previousDoSend = collection._doSend;

    try {
      collection._doSend = false;

      return callback(collection);
    } finally {
      collection._doSend = previousDoSend;
    }
  };

let getOffsetRange = ({ start, end }: Node): OffsetRange | null => {
  if (!isNeitherNullNorUndefined(start) || !isNeitherNullNorUndefined(end)) {
    return null;
  }

  return {
    start,
    end,
  };
};

let getNodeRanges = (
  collection: Collection<any>,
): ReadonlyArray<OffsetRange> => {
  return collection
    .nodes()
    .filter(isNode)
    .map(getOffsetRange)
    .filter(isNeitherNullNorUndefined);
};

let getOffsetRangeFromMethodName = (
  originalMethodName: string,
  str: string,
): OffsetRange => {
  let regex = new RegExp(`^${originalMethodName}_(\\d+)_(\\d+)$`);

  let regExpMatchArray = regex.exec(str);

  let matchedStart = regExpMatchArray?.[1];
  let matchedEnd = regExpMatchArray?.[2];

  let start =
    matchedStart !== undefined ? Number.parseInt(matchedStart, 10) : Number.NaN;
  let end =
    matchedEnd !== undefined ? Number.parseInt(matchedEnd, 10) : Number.NaN;

  return { start, end };
};

export let buildNodeProxy = <T extends object>(node: T): T => {
  let HIDDEN_ATTRIBUTES = ["start", "end", "loc"];

  return new Proxy(node, {
    get(target, property) {
      if (
        typeof property === "string" &&
        HIDDEN_ATTRIBUTES.includes(property)
      ) {
        return undefined;
      }

      let possibleNode = target[property as keyof typeof target];

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

export let proxifyPath = <T>(
  path: ReturnType<Collection<T>["paths"]>[number],
  eventManager: EventManager,
  onProxifiedPath: (proxifiedPath: ProxifiedPath<any>) => void,
): ProxifiedPath<T> => {
  let { node } = path;

  if (!isNode(node)) {
    return path;
  }

  let beforeSnippetStart = node.start ?? Number.NaN;
  let beforeSnippetEnd = node.end ?? Number.NaN;

  let proxifiedPath = new Proxy(path, {
    get(target, p, receiver) {
      if (typeof p !== "string") {
        return Reflect.get(target, p, receiver);
      }

      if (p.startsWith("replace_")) {
        let codemodSourceRange = getOffsetRangeFromMethodName("replace", p);

        return new Proxy(target.replace, {
          apply: (replaceTarget, thisArg, argArray) => {
            let codes: string[] = [];

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

export let proxifyCollection = <T>(
  _collection: Collection<T>,
  eventManager: EventManager,
  onProxifiedCollection: (
    proxifiedCollection: ProxifiedCollection<any>,
  ) => void,
  onProxifiedPath: (proxifiedPath: ProxifiedPath<any>) => void,
): ProxifiedCollection<T> => {
  let nodeType = _collection.getTypes()[0] ?? "";

  let collection = Object.assign(_collection, {
    _doSend: true,
  });

  let proxifiedCollection = new Proxy(collection, {
    get(target, p, receiver) {
      if (typeof p !== "string") {
        return Reflect.get(target, p, receiver);
      }

      if (p.startsWith("paths_")) {
        let codemodSourceRange = getOffsetRangeFromMethodName("paths", p);

        return new Proxy(target.paths, {
          apply: (findTarget, thisArg, argArray) => {
            let astPaths: ASTPath<any>[] = Reflect.apply(
              findTarget,
              thisArg,
              argArray,
            );

            let proxifiedPaths = astPaths.map((astPath) =>
              proxifyPath(astPath, eventManager, onProxifiedPath),
            );

            let snippetBeforeRanges = proxifiedPaths
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
        let methodName = p.startsWith("forEach")
          ? "forEach"
          : p.startsWith("map")
            ? "map"
            : "filter";

        let codemodSourceRange = getOffsetRangeFromMethodName(methodName, p);

        return new Proxy(target[methodName], {
          apply: (findTarget, thisArg: ProxifiedCollection<any>, argArray) => {
            // HERE
            let nodeType = thisArg.getTypes()[0] ?? "";
            let timestamp = Date.now();

            let snippetBeforeRanges: OffsetRange[] = [];
            let codes: string[] = [];

            let index = eventManager.pushEvent({
              kind: "path",
              codemodSourceRange,
              timestamp,
              snippetBeforeRanges,
              nodeType,
              mode: "lookup",
              codes,
            });

            let totalNodeCount = thisArg.nodes().length;
            let currentNodeCount = 0;

            let increaseNodeCount = () => {
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

            let callback: Parameters<Collection[typeof methodName]>[0] = (
              path,
              i,
              paths,
            ) => {
              let proxifiedPath = proxifyPath(
                path,
                eventManager,
                onProxifiedPath,
              );
              let { node } = proxifiedPath;

              snippetBeforeRanges.push({
                start: node.start ?? Number.NaN,
                end: node.end ?? Number.NaN,
              });

              let proxiedNode = buildNodeProxy(node);
              // removeLocationProperties(node);

              let printedNodeBefore = print(proxiedNode);

              let value = argArray[0](proxifiedPath, i, paths);

              // removeLocationProperties(node);

              let printedNodeAfter = print(proxiedNode);

              if (printedNodeBefore.code !== printedNodeAfter.code) {
                codes.push(printedNodeAfter.code);
              }

              increaseNodeCount();

              return value;
            };

            let descendantCollection = Reflect.apply(
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
        let methodName = p.startsWith("some") ? "some" : "every";

        let codemodSourceRange = getOffsetRangeFromMethodName(methodName, p);

        return new Proxy(target[methodName], {
          apply: (findTarget, thisArg: ProxifiedCollection<any>, argArray) => {
            let nodeType = thisArg.getTypes()[0] ?? "";
            let timestamp = Date.now();

            let index = eventManager.pushEvent({
              kind: "path",
              codemodSourceRange,
              timestamp,
              snippetBeforeRanges: [],
              nodeType,
              mode: "lookup",
              codes: [],
            });

            let snippetBeforeRanges: OffsetRange[] = [];

            let totalNodeCount = thisArg.nodes().length;
            let currentNodeCount = 0;

            let increaseNodeCount = () => {
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

            let callback: Parameters<Collection[typeof methodName]>[0] = (
              path,
              i,
              paths,
            ) => {
              let proxifiedPath = proxifyPath(
                path,
                eventManager,
                onProxifiedPath,
              );

              let value = argArray[0](proxifiedPath, i, paths);

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
        let methodName = p.startsWith("find_")
          ? "find"
          : p.startsWith("findVariableDeclarators")
            ? "findVariableDeclarators"
            : "findJSXElements";

        let codemodSourceRange = getOffsetRangeFromMethodName(methodName, p);

        return new Proxy(target[methodName], {
          apply: (findTarget, thisArg, argArray) => {
            let descendantCollection: Collection<any> = Reflect.apply(
              findTarget,
              thisArg,
              argArray,
            );

            let snippetBeforeRanges =
              getNodeRanges(descendantCollection).slice();

            let nodeType = descendantCollection.getTypes()[0] ?? "";

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
        let codemodSourceRange = getOffsetRangeFromMethodName("toSource", p);

        return new Proxy(target.toSource, {
          apply: (toSourceTarget, thisArg, argArray) => {
            let source = Reflect.apply(toSourceTarget, thisArg, argArray);

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
        let codemodSourceRange = getOffsetRangeFromMethodName("remove", p);

        return new Proxy(target.remove, {
          apply: (
            removeTarget,
            thisArg: ProxifiedCollection<any>,
            argArray,
          ) => {
            let snippetBeforeRanges = getNodeRanges(thisArg).slice();

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
        let codemodSourceRange = getOffsetRangeFromMethodName(
          "replaceWith",
          p,
        );

        return new Proxy(target.replaceWith, {
          apply: (
            replaceWithTarget,
            thisArg: ProxifiedCollection<any>,
            argArray,
          ) => {
            let snippetBeforeRanges = getNodeRanges(thisArg).slice();

            let [firstArgument] = argArray;

            if (typeof firstArgument === "string") {
              let code = firstArgument;

              let value = withNoSend(thisArg)(() =>
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
              let { value, codes } = withNoSend(thisArg)(() => {
                let codes: string[] = [];

                let wrappedCallback = (path: ASTPath, i: number) => {
                  let node: ASTNode = firstArgument(path, i);

                  let proxiedNode = buildNodeProxy(node);

                  codes.push(print(proxiedNode).code);

                  return node;
                };

                let value = Reflect.apply(replaceWithTarget, thisArg, [
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
                let codes = [];

                try {
                  let node = buildNodeProxy(firstArgument);

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

export let proxifyJSCodeshift = (
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

      let collection = Reflect.apply(target, thisArg, argArray);

      return proxifyCollection(
        collection,
        eventManager,
        onProxifiedCollection,
        onProxifiedPath,
      );
    },
  });
};
