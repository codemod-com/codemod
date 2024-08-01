/* @license

ISC License

Copyright (c) 2023, Gonzalo D'Elia

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

/*
Changes to the original file: changed tests structure
*/

import assert from "node:assert";
import { buildApi } from "@codemod-com/codemod-utils";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("replace-react-fc-typescript", () => {
  it("should replace react fc", () => {
    const INPUT = `
			type Props2 = { id: number };
			export const MyComponent2: React.FC<Props2> = (props) => {
			  return <span>{props.id}</span>
			}
		`;

    const OUTPUT = `
			type Props2 = { id: number };
			export const MyComponent2 = (props: Props2) => {
			  return <span>{props.id}</span>
			}
		`;

    const fileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi());
    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should replace inline props definitions", () => {
    const INPUT = `
		export const MyComponent4: React.FC<{ inlineProp: number, disabled?: boolean }> = (props) => <span>foo</span>
		`;

    const OUTPUT = `
			export const MyComponent4 = (
				props: {
				  inlineProp: number,
				  disabled?: boolean
				}
			  ) => <span>foo</span>
		`;

    const fileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi());
    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should replace generics", () => {
    const INPUT = `
			type GenericsProps<T extends any> = { config: T }
			export const MyComponentWithGenerics: React.FC<GenericsProps<string>> = (props) => <span>{props.config}</span>
			export const MyComponentWithGenerics2: React.FC<GenericsProps<{ text: string }>> = ({ config: { text }}) => <span>{text}</span>
		`;

    const OUTPUT = `
			type GenericsProps<T extends any> = { config: T }
			export const MyComponentWithGenerics = (props: GenericsProps<string>) => <span>{props.config}</span>
			export const MyComponentWithGenerics2 = (
			  {
				config: { text }
			  }: GenericsProps<{ text: string }>
			) => <span>{text}</span>
		`;

    const fileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi());
    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should replace props defined with intersection", () => {
    const INPUT = `
			const WithIntersection: React.FC<Props1 & Props2> = ({ id, ...restProps }) => <span>{id}</span>
		`;

    const OUTPUT = `
			const WithIntersection = ( { id, ...restProps }: Props1 & Props2 ) => <span>{id}</span>
		`;

    const fileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi());
    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should replace props defined with intersection", () => {
    const INPUT = `
			import React from 'react';
			import { OtherComponent } from "./other-component";

			interface Props { text: string }
			const WithComponentIntersection: React.FC<Props> & {
			  OtherComponent: typeof OtherComponent;
			} = (props) => {
			  return <span>{props.text}</span>
			}
			WithComponentIntersection.OtherComponent = OtherComponent;
		`;

    const OUTPUT = `
			import React from 'react';
			import { OtherComponent } from "./other-component";

			interface Props { text: string }
			const WithComponentIntersection = (props: Props) => {
			  return <span>{props.text}</span>
			}
			WithComponentIntersection.OtherComponent = OtherComponent;
		`;

    const fileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi());
    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should work even with no props", () => {
    const INPUT = `
			const NoPropsComponent: React.FC = () => <span>foo</span>
		`;

    const OUTPUT = `
			const NoPropsComponent = () => <span>foo</span>
		`;

    const fileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi());
    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should work with regular named functions", () => {
    const INPUT = `
			import React from 'react'

			interface Props { text: string }
			const HelloWorld: React.SFC<Props> = function HelloWorld(props) {
			  return <div>Hi {props.someValue}</div>
			}
		`;

    const OUTPUT = `
			import React from 'react'

			interface Props { text: string }
			const HelloWorld = function HelloWorld(props: Props) {
			  return <div>Hi {props.someValue}</div>
			}
		`;

    const fileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi());
    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should work when you use a function that accepts a component definition", () => {
    const INPUT = `
			import React from 'react';
			import { observer } from "mobx-react-lite";

			type Props = { id: number };
			const functionAcceptsComponent: React.FC<Props> = observer((props) => {
			  return <span>{props.id}</span>
			})
		`;

    const OUTPUT = `
			import React from 'react';
			import { observer } from 'mobx-react-lite';
			
			type Props = { id: number };
			const functionAcceptsComponent = observer((props: Props) => {
				return <span>{props.id}</span>;
			});
		`;

    const fileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi());
    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should work when using FC, FunctionComponent and SFC as a named export", () => {
    const INPUT = `
			import React, { FC } from 'react'

			const NamedExportComponent: FC<Props> = (props) => <span>foo</span>
		`;

    const OUTPUT = `
			import React, { FC } from 'react'

			const NamedExportComponent = (props: Props) => <span>foo</span>
		`;

    const fileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi());
    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
