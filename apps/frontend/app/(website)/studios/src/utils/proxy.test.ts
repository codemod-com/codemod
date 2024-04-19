import jscodeshift from "jscodeshift";
import { describe, expect, it, vi } from "vitest";
import type { Event } from "../schemata/eventSchemata";
import { EventManager } from "./eventManager";
import { proxifyJSCodeshift } from "./proxy";

describe("proxy", () => {
	it("should report the correct number of proxy events", () => {
		const eventManager = new EventManager();
		const proxyEvents: Event[] = [];

		const onProxifiedCollectionSpy = vi.fn();
		const onProxifiedPathSpy = vi.fn();

		const j = proxifyJSCodeshift(
			jscodeshift.withParser("tsx"),
			eventManager,
			onProxifiedCollectionSpy,
			onProxifiedPathSpy,
		);

		const fileCollection = j("const i = j;\nlet k = 3;");

		const identifierCollection = fileCollection.find(j.Identifier);

		identifierCollection.replaceWith(() => j.identifier("t"));

		const variableDeclaratorCollection = fileCollection.find(
			j.VariableDeclarator,
		);

		variableDeclaratorCollection.remove();

		const source = fileCollection.toSource();

		expect(source).toBe("");
		expect(proxyEvents.length).toBe(0);
		expect(onProxifiedCollectionSpy).toBeCalledTimes(1);
		expect(onProxifiedPathSpy).not.toBeCalled();
	});
});
