import type { API, FileInfo } from "jscodeshift";

function transform(file: FileInfo, api: API): string | undefined {
	const j = api.jscodeshift;

	const root = j(file.source);
	return root
		.find(j.CallExpression, {
			callee: {
				object: { name: "history" },
				property: { name: "push" },
			},
			// @ts-ignore Type '{ length: number; 1: { type: "ObjectExpression"; }; }' is not assignable to type 'undefined'.
			arguments: {
				length: 2,
				1: { type: "ObjectExpression" },
			},
		})
		.forEach((path) => {
			const secondArg = path.value.arguments[1];
			if (!j.ObjectExpression.check(secondArg)) {
				return;
			}
			const state = secondArg.properties.find(
				(property) =>
					j.Property.check(property) &&
					j.Identifier.check(property.key) &&
					property.key.name === "state",
			);

			if (!state) {
				return;
			}

			// @ts-ignore Property 'value' does not exist on type 'SpreadElement'.
			path.value.arguments[1] = state.value;
		})
		.toSource();
}

export default transform;
