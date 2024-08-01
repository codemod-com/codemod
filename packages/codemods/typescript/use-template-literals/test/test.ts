import assert from "node:assert";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("use-template-literals", () => {
  describe("variables declared with let", () => {
    it("one variable", () => {
      const INPUT = `
				let name = 'John';
				let greeting = 'Hello, ' + name + '!';
			`;

      const OUTPUT = `
				let name = 'John';
				let greeting = \`Hello, \${name}!\`;
			`;
      const fileInfo: FileInfo = {
        path: "index.ts",
        source: INPUT,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"));

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });

    it("two variables", () => {
      const INPUT = `
				let name = 'John';
				let age = 12;
				let greeting = name + 'is ' + age + ' years old!';
			`;

      const OUTPUT = `
				let name = 'John';
				let age = 12;
				let greeting = \`\${name} is \${age} years old!\`;
			`;
      const fileInfo: FileInfo = {
        path: "index.ts",
        source: INPUT,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"));

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });

    it("three variables", () => {
      const INPUT = `
				let name = 'John';
				let age = 12;
				let gender = 'male';
				let greeting = name + age + gender;
			`;

      const OUTPUT = `
				let name = 'John';
				let age = 12;
				let gender = 'male';
				let greeting = \`\${name}\${age}\${gender}\`;
			`;
      const fileInfo: FileInfo = {
        path: "index.ts",
        source: INPUT,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"));

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });
  });

  describe("variables declared with var", () => {
    it("one variable", () => {
      const INPUT = `
				var name = 'John';
				var greeting = 'Hello, ' + name + '!';
			`;

      const OUTPUT = `
				var name = 'John';
				var greeting = \`Hello, \${name}!\`;
			`;
      const fileInfo: FileInfo = {
        path: "index.ts",
        source: INPUT,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"));

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });

    it("two variables", () => {
      const INPUT = `
				var name = 'John';
				var age = 12;
				var greeting = name + 'is ' + age + ' years old!';
			`;

      const OUTPUT = `
				var name = 'John';
				var age = 12;
				var greeting = \`\${name} is \${age} years old!\`;
			`;
      const fileInfo: FileInfo = {
        path: "index.ts",
        source: INPUT,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"));

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });

    it("three variables", () => {
      const INPUT = `
				var name = 'John';
				var age = 12;
				var gender = 'male';
				var greeting = name + age + gender;
			`;

      const OUTPUT = `
				var name = 'John';
				var age = 12;
				var gender = 'male';
				var greeting = \`\${name}\${age}\${gender}\`;
			`;
      const fileInfo: FileInfo = {
        path: "index.ts",
        source: INPUT,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"));

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });
  });

  describe("variables declared with const", () => {
    it("one variable", () => {
      const INPUT = `
				const name = 'John';
				const greeting = 'Hello, ' + name + '!';
			`;

      const OUTPUT = `
				const name = 'John';
				const greeting = \`Hello, \${name}!\`;
			`;
      const fileInfo: FileInfo = {
        path: "index.ts",
        source: INPUT,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"));

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });

    it("two variables", () => {
      const INPUT = `
				const name = 'John';
				const age = 12;
				const greeting = name + 'is ' + age + ' years old!';
			`;

      const OUTPUT = `
				const name = 'John';
				const age = 12;
				const greeting = \`\${name} is \${age} years old!\`;
			`;
      const fileInfo: FileInfo = {
        path: "index.ts",
        source: INPUT,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"));

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });

    it("three variables", () => {
      const INPUT = `
				const name = 'John';
				const age = 12;
				const gender = 'male';
				const greeting = name + age + gender;
			`;

      const OUTPUT = `
				const name = 'John';
				const age = 12;
				const gender = 'male';
				const greeting = \`\${name}\${age}\${gender}\`;
			`;
      const fileInfo: FileInfo = {
        path: "index.ts",
        source: INPUT,
      };

      const actualOutput = transform(fileInfo, buildApi("tsx"));

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        OUTPUT.replace(/\W/gm, ""),
      );
    });
  });
});
