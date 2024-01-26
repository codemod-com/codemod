/*! @license

This code is based on a public codemod, which is subject to the original license terms.
Original codemod: https://github.com/ember-codemods/ember-3x-codemods/blob/master/transforms/deprecate-router-events/index.js

MIT License

Copyright (c) 2019 ember-codemods

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

export default function transform(file, api) {
	const j = api.jscodeshift;

	const root = j(file.source);

	const createInit = (props, exp1, exp2) => {
		// First create the super call for init
		let superCall = j.expressionStatement(
			j.callExpression(
				j.memberExpression(
					j.thisExpression(),
					j.identifier('_super'),
					false,
				),
				[j.identifier('...arguments')],
			),
		);

		let initProp = j.objectMethod(
			'method',
			j.identifier('init'),
			[],
			j.blockStatement([superCall, exp1, exp2]),
		);

		props.push(initProp);
	};

	root.find(j.ExportDefaultDeclaration, {
		declaration: {
			callee: {
				object: {
					name: 'Router',
				},
			},
		},
	}).forEach((path) => {
		let args = path.value.declaration.arguments[0];
		let props = args.properties;

		let idxWillTransition = props.findIndex(
			(p) => p.key.name === 'willTransition',
		);
		let routeWillChange;

		if (idxWillTransition >= 0) {
			let wtBody = props[idxWillTransition].value
				? props[idxWillTransition].value.body.body
				: props[idxWillTransition].body.body;

			wtBody.splice(0, 1); // Remove super call
			routeWillChange = j.expressionStatement(
				j.callExpression(
					j.memberExpression(
						j.thisExpression(),
						j.identifier('on'),
						false,
					),
					[
						j.literal('routeWillChange'),
						j.arrowFunctionExpression(
							[j.identifier('transition')],
							j.blockStatement(wtBody),
							false,
						),
					],
				),
			);

			// Cleanup
			props.splice(
				props.findIndex((p) => p.key.name === 'willTransition'),
				1,
			);
		}

		let idxDidTransition = props.findIndex(
			(p) => p.key.name === 'didTransition',
		);
		let routeDidChange;

		if (idxDidTransition >= 0) {
			let dtBody = props[idxDidTransition].value
				? props[idxDidTransition].value.body.body
				: props[idxDidTransition].body.body;

			dtBody.splice(0, 1); // Remove super call

			routeDidChange = j.expressionStatement(
				j.callExpression(
					j.memberExpression(
						j.thisExpression(),
						j.identifier('on'),
						false,
					),
					[
						j.literal('routeDidChange'),
						j.arrowFunctionExpression(
							[j.identifier('transition')],
							j.blockStatement(dtBody),
							false,
						),
					],
				),
			);

			// Cleanup
			props.splice(
				props.findIndex((p) => p.key.name === 'didTransition'),
				1,
			);
		}

		let initFn = props.filter((p) => {
			return p.key.name === 'init';
		})[0];

		if (initFn) {
			let initFnBody = initFn.body.body;
			initFnBody.push(routeWillChange, routeDidChange);
		} else {
			// We don't have an init() , hence create one

			createInit(props, routeWillChange, routeDidChange);
		}
	});

	return root.toSource({ quote: 'single' });
}
