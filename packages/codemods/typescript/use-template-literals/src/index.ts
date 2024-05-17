import type { API, BinaryExpression, Expression, FileInfo } from 'jscodeshift';

let isStringLiteral = (node: Expression) =>
	node && node.type === 'StringLiteral';

let transformHelper = (node: BinaryExpression, api: API) => {
	let j = api.jscodeshift;
	let leftNode = node.left;
	let rightNode = node.right;
	let left =
		leftNode && leftNode.type === 'StringLiteral'
			? j.literal(`${leftNode.value}`)
			: leftNode;
	let right =
		rightNode && rightNode.type === 'StringLiteral'
			? j.literal(`${rightNode.value}`)
			: rightNode;

	return j.templateLiteral(
		[
			j.templateElement({ raw: '', cooked: '' }, false),
			j.templateElement({ raw: '', cooked: '' }, true),
		],
		[left, right],
	);
};

export default function transformer(file: FileInfo, api: API) {
	let j = api.jscodeshift;
	let root = j(file.source);

	root.find(j.BinaryExpression, { operator: '+' })
		.filter(
			(path) =>
				isStringLiteral(path.node.left) ||
				isStringLiteral(path.node.right),
		)
		.forEach((path) => transformHelper(path.node, api));

	return root.toSource();
}
