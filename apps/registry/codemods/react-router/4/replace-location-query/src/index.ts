import type { API, FileInfo } from "jscodeshift";

function transform(file: FileInfo, api: API) {
	const j = api.jscodeshift;
	const root = j(file.source);
	let dirtyFlag = false;

	// Replace location.query with parse(location.search)
	root
		.find(j.MemberExpression, {
			object: {
				name: "location",
			},
			property: {
				name: "query",
			},
		})
		.replaceWith(() => {
			dirtyFlag = true;
			return j.callExpression(j.identifier("parse"), [
				j.memberExpression(j.identifier("location"), j.identifier("search")),
			]);
		});

	// Replace props.location.query with parse(props.location.search)
	root
		.find(j.MemberExpression, {
			object: {
				type: "MemberExpression",
				object: {
					name: "props",
				},
				property: {
					name: "location",
				},
			},
			property: {
				name: "query",
			},
		})
		.replaceWith(() => {
			dirtyFlag = true;
			return j.callExpression(j.identifier("parse"), [
				j.memberExpression(
					j.memberExpression(j.identifier("props"), j.identifier("location")),
					j.identifier("search"),
				),
			]);
		});

	// Replace ownProps.location.query with parse(ownProps.location.search)
	root
		.find(j.MemberExpression, {
			object: {
				type: "MemberExpression",
				object: {
					name: "ownProps",
				},
				property: {
					name: "location",
				},
			},
			property: {
				name: "query",
			},
		})
		.replaceWith(() => {
			dirtyFlag = true;
			return j.callExpression(j.identifier("parse"), [
				j.memberExpression(
					j.memberExpression(
						j.identifier("ownProps"),
						j.identifier("location"),
					),
					j.identifier("search"),
				),
			]);
		});

	// Handle `...props.location.query`
	root
		.find(j.SpreadElement, {
			argument: {
				type: "MemberExpression",
				object: {
					type: "MemberExpression",
					object: {
						name: "props",
					},
				},
			},
		})
		.replaceWith(() => {
			dirtyFlag = true;
			return j.spreadElement(
				j.callExpression(j.identifier("parse"), [
					j.memberExpression(j.identifier("location"), j.identifier("search")),
				]),
			);
		});

	const hasQueryStringImport =
		root.find(j.ImportDeclaration, {
			source: {
				value: "query-string",
			},
		}).length > 0;

	if (!hasQueryStringImport && dirtyFlag) {
		root.find(j.Program).forEach((path) => {
			path.node.body.unshift(
				j.importDeclaration(
					[j.importSpecifier(j.identifier("parse"), null)],
					j.literal("query-string"),
				),
			);
		});
	}

	return root.toSource();
}

export default transform;
