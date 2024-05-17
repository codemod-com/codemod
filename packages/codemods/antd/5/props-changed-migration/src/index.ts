/*! @license
MIT LICENSE

Copyright (c) 2015-present Ant UED, https://xtech.antfin.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

The source code has been taken from https://github.com/ant-design/codemod-v5/blob/main/transforms/v5-props-changed-migration.js

Changes to the original file: added TypeScript support
*/

import type { Collection, JSCodeshift, Transform } from 'jscodeshift';
import {
	createObjectExpression,
	createObjectProperty,
	findAllAssignedNames,
	getJSXAttributeValue,
} from './ast.js';
import { printOptions } from './config.js';

function parseStrToArray(antdPkgNames: string) {
	return (antdPkgNames || '')
		.split(',')
		.filter((n) => n)
		.map((n) => n.trim());
}

let changedComponentPropsMap = {
	AutoComplete: {
		dropdownClassName: {
			action: 'rename',
			replacer: 'popupClassName',
		},
	},
	Cascader: {
		dropdownClassName: {
			action: 'rename',
			replacer: 'popupClassName',
		},
	},
	Select: {
		dropdownClassName: {
			action: 'rename',
			replacer: 'popupClassName',
		},
	},
	TreeSelect: {
		dropdownClassName: {
			action: 'rename',
			replacer: 'popupClassName',
		},
	},
	// 处理 compound components: TimePicker.RangePicker
	TimePicker: {
		dropdownClassName: {
			action: 'rename',
			replacer: 'popupClassName',
		},
	},
	'TimePicker.RangePicker': {
		dropdownClassName: {
			action: 'rename',
			replacer: 'popupClassName',
		},
	},
	// 处理 compound components: DatePicker.RangePicker
	DatePicker: {
		dropdownClassName: {
			action: 'rename',
			replacer: 'popupClassName',
		},
	},
	'DatePicker.RangePicker': {
		dropdownClassName: {
			action: 'rename',
			replacer: 'popupClassName',
		},
	},
	Mentions: {
		dropdownClassName: {
			action: 'rename',
			replacer: 'popupClassName',
		},
	},
	Drawer: {
		visible: {
			action: 'rename',
			replacer: 'open',
		},
		className: {
			action: 'rename',
			replacer: 'rootClassName',
		},
		style: {
			action: 'rename',
			replacer: 'rootStyle',
		},
	},
	Modal: {
		visible: {
			action: 'rename',
			replacer: 'open',
		},
	},
	Dropdown: {
		visible: {
			action: 'rename',
			replacer: 'open',
		},
	},
	Tooltip: {
		visible: {
			action: 'rename',
			replacer: 'open',
		},
	},
	Tag: {
		visible: {
			action: 'remove',
		},
	},
	Slider: {
		tipFormatter: {
			action: 'rename',
			replacer: 'tooltip.formatter',
		},
		tooltipPlacement: {
			action: 'rename',
			replacer: 'tooltip.placement',
		},
		tooltipVisible: {
			action: 'rename',
			replacer: 'tooltip.open',
		},
	},
	Table: {
		filterDropdownVisible: {
			action: 'rename',
			replacer: 'filterDropdownOpen',
		},
	},
};

let transform: Transform = (file, api, options) => {
	let j = api.jscodeshift;
	let root = j(file.source);
	let antdPkgNames = parseStrToArray(options.antdPkgNames || 'antd');

	// [ [DatePicker], [DatePicker, RangePicker] ]
	let componentTuple = Object.keys(changedComponentPropsMap).map(
		(component) => component.split('.'),
	);

	function handlePropsTransform<T>(
		collection: Collection<T>,
		componentConfig: (typeof changedComponentPropsMap)[keyof typeof changedComponentPropsMap],
	) {
		let hasChanged = false;
		Object.keys(componentConfig).forEach((propName) => {
			collection
				.find(j.JSXAttribute, {
					name: {
						type: 'JSXIdentifier',
						name: propName,
					},
				})
				.filter((nodePath) => {
					// 只找第一层的 JSXElement 的 Attributes
					return (
						j.JSXOpeningElement.check(nodePath.parent.node) &&
						collection.paths().includes(nodePath.parent.parent)
					);
				})
				.forEach((nodePath) => {
					// @ts-expect-error type ambiguity
					let { action, replacer } = componentConfig[propName];
					if (action === 'rename' && replacer) {
						// <Slider tooltipVisible /> -> <Slider tooltip={{open: true}} />
						if (replacer.includes('.')) {
							let value = getJSXAttributeValue(j, nodePath);

							// delete origin `props`
							nodePath.parent.node.attributes =
								nodePath.parent.node.attributes.filter(
									// @ts-expect-error type ambiguity
									(attr) => attr.name.name !== propName,
								);

							hasChanged = true;

							let [propKey, propSubKey] = replacer.split('.');
							// 检测是否已存在对应的 property 没有则创建一个新的
							// 获取 `Tag` 的 props
							let existedPropKeyAttr = j(
								nodePath.parent.parent,
							).find(j.JSXAttribute, {
								name: {
									type: 'JSXIdentifier',
									name: propKey,
								},
							});
							if (existedPropKeyAttr.length === 0) {
								let newPropKeyAttr = j.jsxAttribute(
									j.jsxIdentifier(propKey),
									j.jsxExpressionContainer(
										createObjectExpression(j, {
											[propSubKey]: value,
										}),
									),
								);

								// 给对应 property 新增值
								nodePath.parent.node.attributes.push(
									newPropKeyAttr,
								);
							} else {
								// @ts-expect-error type ambiguity
								existedPropKeyAttr
									.paths()[0]
									// @ts-expect-error type ambiguity
									.value.value.expression.properties.push(
										createObjectProperty(
											j,
											propSubKey,
											// @ts-expect-error type ambiguity
											value,
										),
									);
							}
						} else {
							// <Modal visible={1} /> -> <Modal open={1} />
							nodePath.node.name = replacer;
							hasChanged = true;
						}
					}

					if (action === 'remove') {
						// <Tag visible="1" />
						let value = nodePath.value.value;
						// <Tag visible={1} />
						// 取出来 JSXExpressionContainer 其中值部分
						if (
							nodePath.value?.value?.type ===
							'JSXExpressionContainer'
						) {
							// @ts-expect-error type ambiguity
							value = nodePath.value.value.expression;
						}

						// delete origin `props`
						nodePath.parent.node.attributes =
							nodePath.parent.node.attributes.filter(
								// @ts-expect-error type ambiguity
								(attr) => attr.name.name !== propName,
							);

						hasChanged = true;

						// <Tag visible />
						// 这种情况直接去掉 visible 即可

						// 有 value 再创建条件语句，没有 value 则默认为 true
						// create a conditional expression
						let conditionalExpression = value
							? j.conditionalExpression(
									value,
									// Component Usage JSXElement `<Tag />`
									nodePath.parent.parent.node,
									j.nullLiteral(),
								)
							: null;

						// <><Tag visible={vi} /></>
						// <div><Tag visible={vi} /></div>
						// return (<Tag visible={vi} />);
						//  <- transform to ->
						// <>{vi && <Tag />}</>
						// <div>{vi && <Tag />}</div>
						// return (vi && <Tag />)

						if (conditionalExpression) {
							// vi(JSXIdentifier) -> `<`(JSXOpeningElement) -> <Tag/>(JSXElement)
							// -> `<></>`(JSXFragment) | `<div></div>`(JSXElement)
							if (
								['JSXElement', 'JSXFragment'].includes(
									nodePath.parent.parent.parent.node.type,
								)
							) {
								let index =
									nodePath.parent.parent.parent.node.children.findIndex(
										// @ts-expect-error type ambiguity
										(n) =>
											n === nodePath.parent.parent.node,
									);
								if (index > -1) {
									nodePath.parent.parent.parent.node.children.splice(
										index,
										1,
										// add `{}`
										j.jsxExpressionContainer(
											conditionalExpression,
										),
									);
								}
							} else if (
								['ReturnStatement'].includes(
									nodePath.parent.parent.parent.node.type,
								)
							) {
								nodePath.parent.parent.parent.node.argument =
									conditionalExpression;
							}
						}

						// 将 jsx element 转为一个条件表达式，并使用小括号包住
						// 最后再检查是不是有一个大的 {} JSXExpressionContainer 包住
					}
				});
		});

		return hasChanged;
	}

	// import deprecated components from '@ant-design/compatible'
	function handlePropsChanged<T>(j: JSCodeshift, root: Collection<T>) {
		let hasChanged = false;

		// import { Tag, Mention } from 'antd';
		// import { Form, Mention } from '@forked/antd';
		root.find(j.Identifier)
			.filter(
				(path) =>
					componentTuple.map((n) => n[0]).includes(path.node.name) &&
					path.parent.node.type === 'ImportSpecifier' &&
					antdPkgNames.includes(path.parent.parent.node.source.value),
			)
			.forEach((path) => {
				// import { Tag } from 'antd'
				// import { Tag as Tag1 } from 'antd'
				let importedComponentName = path.parent.node.imported.name;
				let localComponentName = path.parent.node.local.name;

				let componentConfig =
					// @ts-expect-error type ambiguity
					changedComponentPropsMap[importedComponentName];

				let nonCompoundComponent =
					root.findJSXElements(localComponentName);
				// 处理非 compound component 部分
				if (
					handlePropsTransform(nonCompoundComponent, componentConfig)
				) {
					hasChanged = true;
				}

				// 处理 compound component 部分
				let compoundComponentTuple = componentTuple.find(
					(n) => n[0] === importedComponentName && n[1],
				);
				let [, compoundComponentName] = compoundComponentTuple || [];
				if (compoundComponentName) {
					// <DatePicker.RangePicker dropdownClassName="drop" />
					// JSXMemberExpression
					let compoundComponent = root.find(j.JSXElement, {
						openingElement: {
							name: {
								type: 'JSXMemberExpression',
								object: {
									type: 'JSXIdentifier',
									name: localComponentName,
								},
								property: {
									type: 'JSXIdentifier',
									name: compoundComponentName,
								},
							},
						},
					});
					if (
						handlePropsTransform(compoundComponent, componentConfig)
					) {
						hasChanged = true;
					}

					// const { RangePicker } = DatePicker;
					root.find(j.VariableDeclarator, {
						init: {
							type: 'Identifier',
							name: localComponentName,
						},
					}).forEach((path) => {
						// @ts-expect-error type ambiguity
						let localComponentNames = path.node.id.properties
							// @ts-expect-error type ambiguity
							.filter((n) => n.key.name === compoundComponentName)
							// 优先处理解构场景
							// key.name: `const { RangePicker } = DatePicker;`
							// value.name: `const { RangePicker: RP1 } = DatePicker;`
							// @ts-expect-error type ambiguity
							.map((n) => n.value?.name || n.key.name);
						// @ts-expect-error type ambiguity
						localComponentNames.forEach((compoundComponentName) => {
							// 处理反复 reassign 的场景
							let localAssignedNames = findAllAssignedNames(
								root,
								j,
								compoundComponentName,
								[compoundComponentName],
							);

							localAssignedNames.forEach((componentName) => {
								let compoundComponent =
									root.findJSXElements(componentName);
								if (
									handlePropsTransform(
										compoundComponent,
										componentConfig,
									)
								) {
									hasChanged = true;
								}
							});
						});
					});

					// const RangerPicker1 = DatePicker.RangePicker;
					// const RangerPicker2 = RangerPicker1;
					root.find(j.VariableDeclarator, {
						init: {
							type: 'MemberExpression',
							object: {
								type: 'Identifier',
								name: localComponentName,
							},
							property: {
								type: 'Identifier',
								name: compoundComponentName,
							},
						},
					}).forEach((path) => {
						// @ts-expect-error type ambiguity
						let localAssignedName = path.node.id.name;

						// 处理反复 reassign 的场景
						let localAssignedNames = findAllAssignedNames(
							root,
							j,
							localAssignedName,
							[localAssignedName],
						);

						localAssignedNames.forEach((componentName) => {
							let compoundComponent =
								root.findJSXElements(componentName);
							if (
								handlePropsTransform(
									compoundComponent,
									componentConfig,
								)
							) {
								hasChanged = true;
							}
						});
					});
				}
			});

		return hasChanged;
	}

	// step1. import deprecated components from '@ant-design/compatible'
	// step2. cleanup antd import if empty
	let hasChanged = handlePropsChanged(j, root) || false;

	return hasChanged
		? root.toSource(options.printOptions || printOptions)
		: null;
};

export default transform;
