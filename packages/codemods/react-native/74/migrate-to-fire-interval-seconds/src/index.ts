/*! @license
The MIT License (MIT)

Copyright (c) 2023 Codemod.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
Changes to the original file: added TypeScript, dirty flag, nullability checks
*/

import type { API, FileInfo, Options } from 'jscodeshift';
export default function transform(
	file: FileInfo,
	api: API,
	options?: Options,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);

	// Mapping of repeatInterval values to their equivalent in seconds
	let intervalMapping = {
		minute: 60,
		hour: 3600,
		day: 86400,
		week: 604800,
		month: 2592000, // Approximate value, actual value can vary depending on the month
		year: 31536000, // Approximate value, actual value can vary depending on leap years
	};

	// Find all calls to PushNotificationIOS.scheduleLocalNotification
	root.find(j.CallExpression, {
		callee: {
			object: {
				name: 'PushNotificationIOS',
			},
			property: {
				name: 'scheduleLocalNotification',
			},
		},
	}).forEach((path) => {
		// Check if the argument is an object
		if (j.ObjectExpression.check(path.node.arguments[0])) {
			// Find the property 'repeatInterval' and replace it with 'fireIntervalSeconds'
			path.node.arguments[0].properties =
				path.node.arguments[0].properties.map((property) => {
					if (
						'key' in property &&
						'name' in property.key &&
						'value' in property &&
						property.key.name === 'repeatInterval' &&
						j.Literal.check(property.value) &&
						intervalMapping[
							property.value.value as keyof typeof intervalMapping
						]
					) {
						return j.property(
							'init',
							j.identifier('fireIntervalSeconds'),
							j.literal(
								intervalMapping[
									property.value
										.value as keyof typeof intervalMapping
								],
							),
						);
					}
					return property;
				});
		}
	});

	return root.toSource();
}
