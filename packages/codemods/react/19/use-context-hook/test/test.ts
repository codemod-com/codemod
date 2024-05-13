import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react/19/use-context-hook: useContext -> use", () => {
  describe("javascript code", () => {
    it("should replace useContext with use", async () => {
      const input = `
    	import { useContext } from "react";
    	import ThemeContext from "./ThemeContext";

		const theme = useContext(ThemeContext);
		`;

      const output = `
    	import { use } from "react";
    	import ThemeContext from "./ThemeContext";

		const theme = use(ThemeContext);
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi("js"), {
        quote: "single",
      });

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });

    it("should replace useContext with use: mixed import", async () => {
      const input = `
    	import React, { useContext } from "react";
    	import ThemeContext from "./ThemeContext";

		const theme = useContext(ThemeContext);
		`;

      const output = `
    	import React, { use } from "react";
    	import ThemeContext from "./ThemeContext";

		const theme = use(ThemeContext);
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi("js"), {
        quote: "single",
      });

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });

    it("should replace React.useContext with use", async () => {
      const input = `
    	import React from "react";
    	import ThemeContext from "./ThemeContext";

		const theme = React.useContext(ThemeContext);
		`;

      const output = `
    	import React from "react";
    	import ThemeContext from "./ThemeContext";

		const theme = React.use(ThemeContext);
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi("js"), {
        quote: "single",
      });

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });

    it("should not replace any.useContext() with use", async () => {
      const input = `
		const theme = trpc.useContext();
		`;

      // file is skipped
      const output = undefined;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi("js"), {
        quote: "single",
      });

      assert.deepEqual(actualOutput, undefined);
    });
  });

  describe("typescript code", () => {
    it("should replace useContext with use", async () => {
      const input = `
    	import { useContext } from "react";
    	import ThemeContext from "./ThemeContext";

		function Component({
			appUrl,
		  }: {
			appUrl: string;
		  }) {
			const theme = useContext(ThemeContext);
			return <div />;
		};
		`;

      const output = `
    	import { use } from "react";
    	import ThemeContext from "./ThemeContext";

		function Component({
			appUrl,
		  }: {
			appUrl: string;
		  }) {
			const theme = use(ThemeContext);
			return <div />;
		};
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"), {
        quote: "single",
      });

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });

    it("should replace React.useContext with use", async () => {
      const input = `
			import React from "react";
			import ThemeContext from "./ThemeContext";
	
			function Component({
				appUrl,
			  }: {
				appUrl: string;
			  }) {
				const theme = React.useContext(ThemeContext);
				return <div />;
			};
			`;

      const output = `
    	import React from "react";
    	import ThemeContext from "./ThemeContext";

		function Component({
			appUrl,
		  }: {
			appUrl: string;
		  }) {
			const theme = React.use(ThemeContext);
			return <div />;
		};
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"), {
        quote: "single",
      });

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });

    it("should not replace any.useContext() with use", async () => {
      const input = `
			function Component({
				appUrl,
			  }: {
				appUrl: string;
			  }) {
				const theme = trpc.useContext();
				return <div />;
			};
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"), {
        quote: "single",
      });

      assert.deepEqual(actualOutput, undefined);
    });
  });
});
