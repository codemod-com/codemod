/*! @license
This code is based on a public codemod, which is subject to the original license terms.
Original codemod: https://github.com/ember-codemods/ember-qunit-codemod/blob/master/transforms/convert-module-for-to-setup-test/index.js

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

	const POSSIBLE_MODULES = [
		{ expression: { callee: { name: 'module' } } },
		{ expression: { callee: { name: 'moduleFor' } } },
		{ expression: { callee: { name: 'moduleForComponent' } } },
		{ expression: { callee: { name: 'moduleForModel' } } },
		{ expression: { callee: { name: 'moduleForAcceptance' } } },
	];

	class ModuleInfo {
		static isModuleDefinition(nodePath) {
			return POSSIBLE_MODULES.some((matcher) =>
				j.match(nodePath, matcher),
			);
		}

		constructor(p) {
			let calleeName = p.node.expression.callee.name;
			// Find the moduleName and the module's options
			let moduleName,
				subject,
				options,
				hasCustomSubject,
				hasIntegrationFlag,
				isNestedModule,
				moduleCallback,
				moduleCallbackBody;
			let calleeArguments = p.node.expression.arguments.slice();
			let lastArgument = calleeArguments[calleeArguments.length - 1];
			if (lastArgument.type === 'ObjectExpression') {
				options = calleeArguments.pop();
			}

			if (calleeArguments.length === 3) {
				isNestedModule = true;
				moduleName = calleeArguments[0];
				options = calleeArguments[1];
				moduleCallback = calleeArguments[2];
				moduleCallbackBody = moduleCallback.body.body;
			} else if (
				calleeArguments[1] &&
				(j.match(calleeArguments[1], { type: 'FunctionExpression' }) ||
					j.match(calleeArguments[1], {
						type: 'ArrowFunctionExpression',
					}))
			) {
				isNestedModule = true;
				moduleName = calleeArguments[0];
				moduleCallback = calleeArguments[1];
				moduleCallbackBody = moduleCallback.body.body;
			} else {
				moduleName = calleeArguments[1] || calleeArguments[0];
				subject = calleeArguments[0];
			}

			let setupIdentifier = calleeName === 'module' ? null : 'setupTest';
			if (options) {
				hasIntegrationFlag = options.properties.some(
					(p) => p.key.name === 'integration',
				);
				hasCustomSubject = options.properties.some(
					(p) => p.key.name === 'subject',
				);
			}

			if (calleeName === `moduleForAcceptance`) {
				setupIdentifier = 'setupApplicationTest';
				subject = null;
			} else if (calleeName === `moduleForComponent`) {
				if (hasIntegrationFlag) {
					setupIdentifier = 'setupRenderingTest';
					subject = null;
				} else {
					subject = j.literal(
						`component:${calleeArguments[0].value}`,
					);
				}
			} else if (calleeName === 'moduleForModel') {
				subject = j.literal(`model:${calleeArguments[0].value}`);
			}

			this.comments = p.node.comments;
			this.trailingComments = p.node.trailingComments;

			this.originalSetupType = calleeName;
			this.moduleName = moduleName;
			this.moduleOptions = options;
			this.setupType = setupIdentifier;
			this.subjectContainerKey = subject;
			this.hasCustomSubjectImplementation = hasCustomSubject;
			this.isNestedModule = isNestedModule;

			this.moduleInvocation = null;
			this.moduleCallbackBody = moduleCallbackBody;
			this.moduleCallback = moduleCallback;
		}
	}

	function ensureImportWithSpecifiers(options) {
		let source = options.source;
		let specifiers = options.specifiers;
		let anchor = options.anchor;
		let positionMethod = options.positionMethod;

		let importStatement = ensureImport(source, anchor, positionMethod);
		let combinedSpecifiers = new Set(specifiers);

		importStatement
			.find(j.ImportSpecifier)
			.forEach((i) => combinedSpecifiers.add(i.node.imported.name))
			.remove();

		importStatement.get('specifiers').replace(
			Array.from(combinedSpecifiers)
				.sort()
				.map((s) => j.importSpecifier(j.identifier(s))),
		);
	}

	function ensureImport(source, anchor, method) {
		method = method || 'insertAfter';

		let desiredImport = root.find(j.ImportDeclaration, {
			source: { value: source },
		});
		if (desiredImport.size() > 0) {
			return desiredImport;
		}

		let newImport = j.importDeclaration([], j.literal(source));
		let anchorImport = root.find(j.ImportDeclaration, {
			source: { value: anchor },
		});
		let imports = root.find(j.ImportDeclaration);
		if (anchorImport.size() > 0) {
			anchorImport.at(anchorImport.size() - 1)[method](newImport);
		} else if (imports.size() > 0) {
			// if anchor is not present, always add at the end
			imports.at(imports.size() - 1).insertAfter(newImport);
		} else {
			// if no imports are present, add as first statement
			root.get().node.program.body.unshift(newImport);
		}

		return j(newImport);
	}

	function moveQUnitImportsFromEmberQUnit() {
		let emberQUnitImports = root.find(j.ImportDeclaration, {
			source: { value: 'ember-qunit' },
		});
		// Find `module` and `test` imports
		let migrateToQUnitImport = ['module', 'test', 'skip', 'todo'];

		let specifiers = new Set();
		// Replace old with new test helpers imports
		emberQUnitImports
			.find(j.ImportSpecifier)
			.filter(
				(p) =>
					migrateToQUnitImport.indexOf(p.node.imported.name) !== -1,
			)
			.forEach((p) => specifiers.add(p.node.imported.name))
			.remove();

		if (specifiers.size === 0) {
			return;
		}

		ensureImportWithSpecifiers({
			source: 'qunit',
			anchor: 'ember-qunit',
			positionMethod: 'insertBefore',
			specifiers,
		});
	}

	function updateToNewEmberQUnitImports() {
		let mapping = {
			moduleFor: 'setupTest',
			moduleForComponent: 'setupRenderingTest',
			moduleForModel: 'setupTest',
		};

		let emberQUnitImports = root.find(j.ImportDeclaration, {
			source: { value: 'ember-qunit' },
		});
		if (emberQUnitImports.size() === 0) {
			return;
		}

		// Collect all imports from ember-qunit into local array
		let emberQUnitSpecifiers = new Set();

		emberQUnitImports
			.find(j.ImportSpecifier)
			.forEach((p) => {
				// Map them to the new imports
				let importName = p.node.imported.name;
				let mappedName = mapping[importName] || importName;

				if (mappedName !== importName) {
					ensureImportWithSpecifiers({
						source: 'qunit',
						anchor: 'ember-qunit',
						positionMethod: 'insertBefore',
						specifiers: ['module'],
					});
				}

				// If importName is `moduleForComponent` determine if we need
				// `setupTest` (unit) or `setupRenderingTest` (integration)
				if (importName === 'moduleForComponent') {
					root.find(j.ExpressionStatement, {
						expression: {
							callee: { name: 'moduleForComponent' },
						},
					}).forEach((p) => {
						let moduleInfo = new ModuleInfo(p);
						emberQUnitSpecifiers.add(moduleInfo.setupType);
					});
				} else {
					emberQUnitSpecifiers.add(mappedName);
				}
			})
			// Remove all existing import specifiers
			.remove();

		emberQUnitImports
			.get('specifiers')
			.replace(
				Array.from(emberQUnitSpecifiers).map((s) =>
					j.importSpecifier(j.identifier(s)),
				),
			);

		// If we have an empty import, remove the import declaration
		if (emberQUnitSpecifiers.size === 0) {
			emberQUnitImports.remove();
		}
	}

	// find moduleForAcceptance import and replace with 'module'
	function migrateModuleForAcceptanceTests() {
		let imports = root.find(j.ImportDeclaration);
		imports
			.find(j.ImportDefaultSpecifier, {
				local: {
					type: 'Identifier',
					name: 'moduleForAcceptance',
				},
			})
			.forEach((p) => {
				// add setupApplicationTest import
				ensureImportWithSpecifiers({
					source: 'ember-qunit',
					anchor: 'qunit',
					specifiers: ['setupApplicationTest'],
				});
				// ensure module import if acceptance test
				ensureImportWithSpecifiers({
					source: 'qunit',
					specifiers: ['module'],
				});
				// remove existing moduleForAcceptance import
				j(p.parentPath.parentPath).remove();
			});
	}

	function findApplicationTestHelperUsageOf(collection, property) {
		return collection.find(j.ExpressionStatement, {
			expression: {
				callee: {
					type: 'Identifier',
					name: property,
				},
			},
		});
	}

	function findTestHelperUsageOf(collection, property) {
		return collection.find(j.ExpressionStatement, {
			expression: {
				callee: {
					object: {
						type: 'ThisExpression',
					},
					property: {
						name: property,
					},
				},
			},
		});
	}

	function addHooksParam(moduleInfo) {
		moduleInfo.moduleCallback.params = [j.identifier('hooks')];
	}

	function addToBeforeEach(moduleInfo, expression) {
		let beforeEachBody = moduleInfo.moduleBeforeEachBody;
		if (!beforeEachBody) {
			if (moduleInfo.moduleCallback) {
				addHooksParam(moduleInfo);
			}

			let beforeEachBlockStatement = j.blockStatement([]);
			let beforeEachExpression = j.expressionStatement(
				j.callExpression(
					j.memberExpression(
						j.identifier('hooks'),
						j.identifier('beforeEach'),
					),
					[
						j.functionExpression(
							null,
							[
								/* no arguments */
							],
							beforeEachBlockStatement,
						),
					],
				),
			);

			beforeEachBody = moduleInfo.moduleBeforeEachBody =
				beforeEachBlockStatement.body;
			let insertAt = moduleInfo.setupType ? 1 : 0;
			moduleInfo.moduleCallbackBody.splice(
				insertAt,
				0,
				beforeEachExpression,
			);
		}

		beforeEachBody.push(expression);
	}

	function updateModuleForToNestedModule() {
		const LIFE_CYCLE_METHODS = [
			{ key: { name: 'before' }, value: { type: 'FunctionExpression' } },
			{ type: 'ObjectMethod', key: { name: 'before' } },
			{
				key: { name: 'beforeEach' },
				value: { type: 'FunctionExpression' },
			},
			{ type: 'ObjectMethod', key: { name: 'beforeEach' } },
			{
				key: { name: 'afterEach' },
				value: { type: 'FunctionExpression' },
			},
			{ type: 'ObjectMethod', key: { name: 'afterEach' } },
			{ key: { name: 'after' }, value: { type: 'FunctionExpression' } },
			{ type: 'ObjectMethod', key: { name: 'after' } },
		];

		function isLifecycleHook(nodePath) {
			return LIFE_CYCLE_METHODS.some((matcher) =>
				j.match(nodePath, matcher),
			);
		}

		function createModule(p) {
			let moduleInfo = new ModuleInfo(p);

			let needsHooks = false;
			let moduleSetupExpression;

			if (moduleInfo.setupType) {
				needsHooks = true;
				moduleSetupExpression = j.expressionStatement(
					j.callExpression(j.identifier(moduleInfo.setupType), [
						j.identifier('hooks'),
					]),
				);
				moduleInfo.moduleSetupExpression = moduleSetupExpression;
			}

			let callback = moduleInfo.moduleCallback;
			if (!callback) {
				// Create the new `module(moduleName, function(hooks) {});` invocation
				callback = j.functionExpression(
					null /* no function name */,
					[],
					j.blockStatement([moduleSetupExpression].filter(Boolean)),
				);
				moduleInfo.moduleCallbackBody = callback.body.body;
				moduleInfo.moduleCallback = callback;
			}
			function buildModule(moduleName, callback) {
				// using j.callExpression() builds this:

				// module(
				//   'some loooooooooooong name',
				//   function(hooks) {
				//     setupTest(hooks);
				//   }
				// );

				// but we want to enforce not having line breaks in the module() invocation
				// so we'll have to use a little hack to get this:

				// module('some loooooooooooong name', function(hooks) {
				//   setupTest(hooks);
				// });

				let node = j(`module('moduleName', function(hooks) {})`)
					.find(j.CallExpression)
					.paths()[0].node;

				node.arguments[0] = moduleName;
				node.arguments[1] = callback;

				return node;
			}

			let moduleInvocation = j.expressionStatement(
				buildModule(moduleInfo.moduleName, callback),
			);

			if (moduleInfo.moduleOptions) {
				let insertLocation;
				if (moduleInfo.isNestedModule) {
					insertLocation = 0;
				} else {
					callback.body.body.length;
				}

				moduleInfo.moduleOptions.properties.forEach((property) => {
					let value =
						property.type === 'ObjectMethod'
							? j.functionExpression(
									null,
									property.params,
									property.body,
							  )
							: property.value;

					if (property.async) {
						value.async = true;
					}

					if (moduleInfo.setupType) {
						let expressionCollection = j(value);

						updateGetOwnerThisUsage(expressionCollection);
						updateLookupCalls(expressionCollection);
						updateRegisterCalls(expressionCollection);
						updateInjectCalls(expressionCollection);
						updateOnCalls(expressionCollection, moduleInfo);

						if (j.match(property, { key: { name: 'resolver' } })) {
							let setupExpression =
								moduleInfo.moduleSetupExpression;
							setupExpression.expression.arguments.push(
								j.objectExpression([property]),
							);
							return;
						}
					}

					if (isLifecycleHook(property)) {
						needsHooks = true;
						let lifecycleStatement = j.expressionStatement(
							j.callExpression(
								j.memberExpression(
									j.identifier('hooks'),
									property.key,
								),
								[value],
							),
						);

						// preserve any comments that were present
						lifecycleStatement.comments = property.comments;

						if (moduleInfo.isNestedModule) {
							callback.body.body.splice(
								insertLocation,
								0,
								lifecycleStatement,
							);
							insertLocation++;
						} else {
							callback.body.body.push(lifecycleStatement);
						}
					} else {
						const IGNORED_PROPERTIES = [
							'integration',
							'needs',
							'unit',
						];
						if (
							IGNORED_PROPERTIES.indexOf(property.key.name) !== -1
						) {
							return;
						}

						let methodAssignment = j.expressionStatement(
							j.assignmentExpression(
								'=',
								j.memberExpression(
									j.thisExpression(),
									property.key,
								),
								value,
							),
						);

						// preserve any comments that were present
						methodAssignment.comments = property.comments;

						addToBeforeEach(moduleInfo, methodAssignment);
					}
				});

				if (moduleInfo.setupType === 'setupRenderingTest') {
					processExpressionForRenderingTest(callback);
				} else {
					processSubject(callback, moduleInfo);
					processStore(callback, moduleInfo);
				}
			}

			moduleInvocation.comments = moduleInfo.comments;
			moduleInvocation.trailingComments = moduleInfo.trailingComments;
			moduleInfo.moduleInvocation = moduleInvocation;

			if (needsHooks === true) {
				addHooksParam(moduleInfo);
			}

			return moduleInfo;
		}

		function removeAndThens(testExpressionCollection) {
			let replacements = testExpressionCollection
				.find(j.CallExpression, {
					callee: {
						name: 'andThen',
					},
				})
				.map((path) => path.parent)
				.replaceWith((p) => {
					let body = p.node.expression.arguments[0].body;

					return body.body || j.expressionStatement(body);
				});

			if (replacements.length > 0) {
				removeAndThens(testExpressionCollection);
			}
		}

		function processExpressionForApplicationTest(testExpression) {
			// mark the test function as an async function
			let testExpressionCollection = j(testExpression);
			// collect all potential statements to be imported
			let specifiers = new Set();

			// First - remove andThen blocks
			removeAndThens(testExpressionCollection);

			// Second - Transform to await visit(), click, fillIn, touch, etc and adds `async` to scope
			[
				'visit',
				'find',
				'waitFor',
				'fillIn',
				'click',
				'blur',
				'focus',
				'tap',
				'triggerEvent',
				'triggerKeyEvent',
			].forEach((type) => {
				findApplicationTestHelperUsageOf(
					testExpressionCollection,
					type,
				).forEach((p) => {
					specifiers.add(type);

					let expression = p.get('expression');

					let awaitExpression = j.awaitExpression(
						j.callExpression(
							j.identifier(type),
							expression.node.arguments,
						),
					);
					expression.replace(awaitExpression);
					p.scope.node.async = true;
				});
			});

			// Third - update call expressions that do not await
			['currentURL', 'currentRouteName'].forEach((type) => {
				testExpressionCollection
					.find(j.CallExpression, {
						callee: {
							type: 'Identifier',
							name: type,
						},
					})
					.forEach(() => specifiers.add(type));
			});
		}

		function processExpressionForRenderingTest(testExpression) {
			// mark the test function as an async function
			let testExpressionCollection = j(testExpression);
			let specifiers = new Set();

			// Transform to await render() or await clearRender()
			['render', 'clearRender'].forEach((type) => {
				findTestHelperUsageOf(testExpressionCollection, type).forEach(
					(p) => {
						specifiers.add(type);

						let expression = p.get('expression');

						let awaitExpression = j.awaitExpression(
							j.callExpression(
								j.identifier(type),
								expression.node.arguments,
							),
						);
						expression.replace(awaitExpression);
						p.scope.node.async = true;
					},
				);
			});

			ensureImportWithSpecifiers({
				source: '@ember/test-helpers',
				anchor: 'ember-qunit',
				specifiers,
			});

			// Migrate `this._element` -> `this.element`
			testExpressionCollection
				.find(j.MemberExpression, {
					object: {
						type: 'ThisExpression',
					},
					property: {
						name: '_element',
					},
				})
				.forEach((p) => {
					let property = p.get('property');
					property.node.name = 'element';
				});
		}

		function processStore(testExpression, moduleInfo) {
			if (moduleInfo.originalSetupType !== 'moduleForModel') {
				return;
			}

			let thisDotStoreUsage = j(testExpression).find(j.CallExpression, {
				callee: {
					type: 'MemberExpression',
					object: {
						type: 'ThisExpression',
					},
					property: {
						name: 'store',
					},
				},
			});

			if (thisDotStoreUsage.size() === 0) {
				return;
			}

			thisDotStoreUsage.forEach((p) => {
				p.replace(
					j.callExpression(
						j.memberExpression(
							j.memberExpression(
								j.thisExpression(),
								j.identifier('owner'),
							),
							j.identifier('lookup'),
						),
						[j.literal('service:store')],
					),
				);
			});
		}

		function processSubject(testExpression, moduleInfo) {
			let subject = moduleInfo.subjectContainerKey;
			let thisDotSubjectUsage = j(testExpression).find(j.CallExpression, {
				callee: {
					type: 'MemberExpression',
					object: {
						type: 'ThisExpression',
					},
					property: {
						name: 'subject',
					},
				},
			});

			if (thisDotSubjectUsage.size() === 0) {
				return;
			}

			thisDotSubjectUsage.forEach((p) => {
				let options = p.node.arguments[0];
				let split = subject.value.split(':');
				let subjectType = split[0];
				let subjectName = split[1];
				let isSingletonSubject =
					['model', 'component'].indexOf(subjectType) === -1;

				// if we don't have `options` and the type is a singleton type
				// use `this.owner.lookup(subject)`
				if (!options && isSingletonSubject) {
					p.replace(
						j.callExpression(
							j.memberExpression(
								j.memberExpression(
									j.thisExpression(),
									j.identifier('owner'),
								),
								j.identifier('lookup'),
							),
							[subject],
						),
					);
				} else if (subjectType === 'model') {
					ensureImportWithSpecifiers({
						source: '@ember/runloop',
						specifiers: ['run'],
					});

					p.replace(
						j.callExpression(j.identifier('run'), [
							j.arrowFunctionExpression(
								[],
								j.callExpression(
									j.memberExpression(
										j.callExpression(
											j.memberExpression(
												j.memberExpression(
													j.thisExpression(),
													j.identifier('owner'),
												),
												j.identifier('lookup'),
											),
											[j.literal('service:store')],
										),
										j.identifier('createRecord'),
									),
									[j.literal(subjectName), options].filter(
										Boolean,
									),
								),
								true,
							),
						]),
					);
				} else {
					p.replace(
						j.callExpression(
							j.memberExpression(
								j.callExpression(
									j.memberExpression(
										j.memberExpression(
											j.thisExpression(),
											j.identifier('owner'),
										),
										j.identifier('factoryFor'),
									),
									[subject],
								),
								j.identifier('create'),
							),
							[options].filter(Boolean),
						),
					);
				}
			});
		}

		function processBody(bodyPath) {
			let currentModuleInfo;
			bodyPath.each((expressionPath) => {
				let expression = expressionPath.node;
				if (ModuleInfo.isModuleDefinition(expressionPath)) {
					let moduleInfo = createModule(expressionPath);
					expressionPath.replace(moduleInfo.moduleInvocation);

					if (moduleInfo.isNestedModule) {
						processBody(
							j(moduleInfo.moduleCallback)
								.get('body')
								.get('body'),
						);
						return;
					}

					currentModuleInfo = moduleInfo;
				} else if (currentModuleInfo) {
					// calling `path.replace()` essentially just removes
					expressionPath.replace();
					currentModuleInfo.moduleCallbackBody.push(expression);

					let isTest = j.match(expression, {
						expression: { callee: { name: 'test' } },
					});
					if (isTest) {
						let expressionCollection = j(expression);
						updateLookupCalls(expressionCollection);
						updateRegisterCalls(expressionCollection);
						updateInjectCalls(expressionCollection);
						updateOnCalls(expressionCollection, currentModuleInfo);
						// passing the specific function callback here, because `getOwner` is only
						// transformed if the call site's scope is the same as the expression passed
						updateGetOwnerThisUsage(
							j(expression.expression.arguments[1]),
						);
						processStore(expression, currentModuleInfo);

						if (
							currentModuleInfo.setupType ===
							'setupApplicationTest'
						) {
							processExpressionForApplicationTest(expression);
						} else if (
							currentModuleInfo.setupType === 'setupRenderingTest'
						) {
							processExpressionForRenderingTest(expression);
						} else if (
							currentModuleInfo.setupType === 'setupTest' &&
							!currentModuleInfo.hasCustomSubjectImplementation
						) {
							processSubject(expression, currentModuleInfo);
						}
					}
				}
			});
		}

		let programPath = root.get('program');
		let bodyPath = programPath.get('body');

		processBody(bodyPath);
	}

	function updateLookupCalls(ctx) {
		ctx.find(j.MemberExpression, {
			object: {
				object: { type: 'ThisExpression' },
				property: { name: 'container' },
			},
			property: { name: 'lookup' },
		}).forEach((path) => {
			let thisDotOwner = j.memberExpression(
				j.thisExpression(),
				j.identifier('owner'),
			);
			path.replace(j.memberExpression(thisDotOwner, path.value.property));
		});
	}

	function updateRegisterCalls(ctx) {
		ctx.find(j.MemberExpression, {
			object: {
				object: { type: 'ThisExpression' },
				property: { name: 'registry' },
			},
			property: { name: 'register' },
		}).forEach((path) => {
			let thisDotOwner = j.memberExpression(
				j.thisExpression(),
				j.identifier('owner'),
			);
			path.replace(j.memberExpression(thisDotOwner, path.value.property));
		});

		ctx.find(j.MemberExpression, {
			object: { type: 'ThisExpression' },
			property: { name: 'register' },
		}).forEach((path) => {
			let thisDotOwner = j.memberExpression(
				j.thisExpression(),
				j.identifier('owner'),
			);
			path.replace(j.memberExpression(thisDotOwner, path.value.property));
		});
	}

	function updateOnCalls(ctx, moduleInfo) {
		let usages = ctx.find(j.CallExpression, {
			callee: {
				type: 'MemberExpression',
				object: {
					type: 'ThisExpression',
				},
				property: {
					name: 'on',
				},
			},
		});

		usages.forEach((p) => {
			let actionName = p.node.arguments[0].value;
			let property = j.identifier(actionName);

			if (!actionName.match(/^[a-zA-Z_][a-zA-Z0-9]+$/)) {
				// if not, use `this['property-name']`
				property = j.literal(actionName);
			}

			let assignment = j.assignmentExpression(
				'=',
				j.memberExpression(
					j.memberExpression(
						j.thisExpression(),
						j.identifier('actions'),
					),
					property,
				),
				p.node.arguments[1],
			);
			p.replace(assignment);
		});

		if (usages.size() > 0 && !moduleInfo.hasSendFunctionInBeforeEach) {
			moduleInfo.hasSendFunctionInBeforeEach = true;

			addToBeforeEach(
				moduleInfo,
				j.expressionStatement(
					j.assignmentExpression(
						'=',
						j.memberExpression(
							j.thisExpression(),
							j.identifier('actions'),
						),
						j.objectExpression([]),
					),
				),
			);

			addToBeforeEach(
				moduleInfo,
				j.expressionStatement(
					j.assignmentExpression(
						'=',
						j.memberExpression(
							j.thisExpression(),
							j.identifier('send'),
						),
						j.arrowFunctionExpression(
							[
								j.identifier('actionName'),
								j.restElement(j.identifier('args')),
							],
							j.callExpression(
								j.memberExpression(
									j.memberExpression(
										j.memberExpression(
											j.thisExpression(),
											j.identifier('actions'),
										),
										j.identifier('actionName'),
										true,
									),
									j.identifier('apply'),
								),
								[j.thisExpression(), j.identifier('args')],
							),
						),
					),
				),
			);
		}
	}

	function updateInjectCalls(ctx) {
		ctx.find(j.CallExpression, {
			callee: {
				type: 'MemberExpression',
				object: {
					object: {
						type: 'ThisExpression',
					},
					property: {
						name: 'inject',
					},
				},
			},
		}).forEach((p) => {
			let injectType = p.node.callee.property.name;
			let injectedName = p.node.arguments[0].value;
			let localName = injectedName;
			if (p.node.arguments[1]) {
				let options = p.node.arguments[1];
				let as = options.properties.find(
					(property) => property.key.name === 'as',
				);
				if (as) {
					localName = as.value.value;
				}
			}
			let property = j.identifier(localName);
			// rudimentary attempt to confirm the property name is valid
			// as `this.propertyName`
			if (!localName.match(/^[a-zA-Z_][a-zA-Z0-9]+$/)) {
				// if not, use `this['property-name']`
				property = j.literal(localName);
			}
			let assignment = j.assignmentExpression(
				'=',
				j.memberExpression(j.thisExpression(), property),
				j.callExpression(
					j.memberExpression(
						j.memberExpression(
							j.thisExpression(),
							j.identifier('owner'),
						),
						j.identifier('lookup'),
					),
					[j.literal(`${injectType}:${injectedName}`)],
				),
			);

			p.replace(assignment);
		});
	}

	function updateGetOwnerThisUsage(expressionCollection) {
		let expression = expressionCollection.get().node;
		let thisDotOwner = j.memberExpression(
			j.thisExpression(),
			j.identifier('owner'),
		);

		function replacement(path) {
			if (path.scope.node === expression) {
				path.replace(thisDotOwner);
			}
		}

		expressionCollection
			.find(j.CallExpression, {
				callee: {
					name: 'getOwner',
				},
			})
			.forEach(replacement);

		expressionCollection
			.find(j.CallExpression, {
				callee: {
					type: 'MemberExpression',
					object: {
						name: 'Ember',
					},
					property: {
						name: 'getOwner',
					},
				},
			})
			.forEach(replacement);
	}

	function updateWaitUsage() {
		let waitImport = root.find(j.ImportDeclaration, {
			source: { value: 'ember-test-helpers/wait' },
		});

		if (waitImport.size() > 0) {
			let importedName;

			ensureImportWithSpecifiers({
				source: '@ember/test-helpers',
				anchor: 'ember-qunit',
				specifiers: ['settled'],
			});

			waitImport
				.find(j.ImportDefaultSpecifier)
				.forEach((p) => (importedName = p.node.local.name));
			waitImport.remove();

			root.find(j.CallExpression, {
				callee: { name: importedName },
			}).forEach((p) => {
				p.node.callee.name = 'settled';
			});
		}
	}

	const printOptions = { quote: 'single', wrapColumn: 100 };

	moveQUnitImportsFromEmberQUnit();
	updateToNewEmberQUnitImports();
	migrateModuleForAcceptanceTests();
	updateModuleForToNestedModule();
	updateWaitUsage();

	return root.toSource(printOptions);
}
