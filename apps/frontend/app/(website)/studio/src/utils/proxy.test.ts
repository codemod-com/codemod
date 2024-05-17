import jscodeshift from "jscodeshift";
import { describe, expect, it, vi } from "vitest";
import type { Event } from "../schemata/eventSchemata";
import { EventManager } from "./eventManager";
import { proxifyJSCodeshift } from "./proxy";

describe("proxy", () => {
  it("should report the correct number of proxy events", () => {
    let eventManager = new EventManager();
    let proxyEvents: Event[] = [];

    let onProxifiedCollectionSpy = vi.fn();
    let onProxifiedPathSpy = vi.fn();

    let j = proxifyJSCodeshift(
      jscodeshift.withParser("tsx"),
      eventManager,
      onProxifiedCollectionSpy,
      onProxifiedPathSpy,
    );

    let fileCollection = j("const i = j;\nlet k = 3;");

    let identifierCollection = fileCollection.find(j.Identifier);

    identifierCollection.replaceWith(() => j.identifier("t"));

    let variableDeclaratorCollection = fileCollection.find(
      j.VariableDeclarator,
    );

    variableDeclaratorCollection.remove();

    let source = fileCollection.toSource();

    expect(source).toBe("");
    expect(proxyEvents.length).toBe(0);
    expect(onProxifiedCollectionSpy).toBeCalledTimes(1);
    expect(onProxifiedPathSpy).not.toBeCalled();
  });
});
