import type cs from 'jscodeshift';

export default function transformer(file: cs.FileInfo, api: cs.API) {
	let j = api.jscodeshift;
	let root = j(file.source);

	root.find(j.CallExpression).forEach((call) => {
		if (
			call.node.callee.type === 'MemberExpression' &&
			call.node.callee.property.type === 'Identifier' &&
			call.node.callee.property.name === 'gen'
		) {
			if (
				call.node.arguments.length > 0 &&
				call.node.arguments.length <= 2
			) {
				let arg = call.node.arguments[call.node.arguments.length - 1];
				if (
					arg.type === 'FunctionExpression' &&
					arg.generator === true &&
					arg.params.length === 1 &&
					arg.params[0].type === 'Identifier'
				) {
					let adapter = arg.params[0].name;
					arg.params = [];
					j(arg.body)
						.find(j.YieldExpression)
						.forEach((yieldExpr) => {
							if (
								yieldExpr.node.argument?.type ===
								'CallExpression'
							) {
								let call = yieldExpr.node.argument;
								if (
									call.callee.type === 'Identifier' &&
									call.callee.name === adapter
								) {
									if (
										call.arguments.length === 1 &&
										call.arguments[0].type !==
											'SpreadElement'
									) {
										yieldExpr.node.argument =
											call.arguments[0];
									} else if (
										call.arguments.length > 1 &&
										call.arguments[0].type !==
											'SpreadElement'
									) {
										yieldExpr.node.argument =
											j.callExpression(
												j.identifier('pipe'),
												[
													call.arguments[0],
													...call.arguments.slice(1),
												],
											);
									}
								}
							}
						});
				}
			}
		}
	});

	return root.toSource();
}
