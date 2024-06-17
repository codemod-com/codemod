/*! @license

The MIT License (MIT)

Copyright (c) 2023 Vercel, Inc.

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

/*
Changes to the original file: add any typings in places where the compiler complained, added dirtyFlag
*/

import type { API, FileInfo } from 'jscodeshift';

export default function transform(file: FileInfo, api: API) {
	let j = api.jscodeshift;

	let root = j(file.source);

	let dirtyFlag = false;

	root.find(j.ImportDeclaration, { source: { value: 'next/link' } }).forEach(
		(path) => {
			let defaultImport = j(path).find(j.ImportDefaultSpecifier);
			if (defaultImport.size() === 0) {
				return;
			}

			let variableName = j(path)
				.find(j.ImportDefaultSpecifier)
				.find(j.Identifier)
				.get('name').value;
			if (!variableName) {
				return;
			}

			let linkElements = root.findJSXElements(variableName);
			let hasStylesJSX = root
				.findJSXElements('style')
				.some((stylePath) => {
					let $style = j(stylePath);
					let hasJSXProp =
						$style
							.find(j.JSXAttribute, { name: { name: 'jsx' } })
							.size() !== 0;

					return hasJSXProp;
				});

			linkElements.forEach((linkPath) => {
				let $link = j(linkPath).filter((childPath) => {
					// Exclude links with `legacybehavior` prop from modification
					return (
						j(childPath)
							.find(j.JSXAttribute, {
								name: { name: 'legacyBehavior' },
							})
							.size() === 0
					);
				});

				if ($link.size() === 0) {
					return;
				}

				// If file has <style jsx> enable legacyBehavior
				// and keep <a> to  stay on the safe side
				if (hasStylesJSX) {
					$link
						.get('attributes')
						.push(
							j.jsxAttribute(j.jsxIdentifier('legacyBehavior')),
						);

					dirtyFlag = true;

					return;
				}

				let linkChildrenNodes = $link.get('children');

				// Text-only link children are already correct with the new behavior
				// `next/link` would previously auto-wrap typeof 'string' children already
				if (
					linkChildrenNodes.value &&
					linkChildrenNodes.value.length === 1 &&
					linkChildrenNodes.value[0].type === 'JSXText'
				) {
					return;
				}

				// Direct child elements referenced
				let $childrenElements = $link.childElements();
				let $childrenWithA = $childrenElements.filter((childPath) => {
					return (
						j(childPath)
							.find(j.JSXOpeningElement)
							.get('name')
							.get('name').value === 'a'
					);
				});

				// No <a> as child to <Link> so the old behavior is used
				if ($childrenWithA.size() !== 1) {
					$link
						.get('attributes')
						.push(
							j.jsxAttribute(j.jsxIdentifier('legacyBehavior')),
						);

					dirtyFlag = true;

					return;
				}

				let props = $childrenWithA.get('attributes').value;
				let hasProps = props.length > 0;

				if (hasProps) {
					// Add only unique props to <Link> (skip duplicate props)
					let linkPropNames = $link
						.get('attributes')
						.value.map((linkProp: any) => linkProp?.name?.name);
					let uniqueProps: any[] = [];

					props.forEach((anchorProp: any) => {
						if (!linkPropNames.includes(anchorProp?.name?.name)) {
							uniqueProps.push(anchorProp);
						}
					});

					$link.get('attributes').value.push(...uniqueProps);

					dirtyFlag = true;

					// Remove props from <a>
					props.length = 0;
				}

				let childrenProps = $childrenWithA.get('children');
				$childrenWithA.replaceWith(childrenProps.value);

				dirtyFlag = true;
			});
		},
	);

	if (!dirtyFlag) {
		return undefined;
	}

	return root.toSource();
}
