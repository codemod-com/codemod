import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react/19/remove-memoization-hooks", () => {
  describe("javascript code", () => {
    it("should remove useCallback", () => {
      const input = `
		import { useCallback } from 'react';

		function Component() {
			const selectedDateMin3DaysDifference = useCallback(() => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			  }, [today, selectedDate]);
		}
		`;

      const output = `
		function Component() {
			const selectedDateMin3DaysDifference = () => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			};
		}
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi());

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });

    it("should remove useMemo", () => {
      const input = `
		import { useMemo } from 'react';

		function Component() {
			const selectedDateMin3DaysDifference = useMemo(() => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			  }, [today, selectedDate]);
		}
		`;

      const output = `
		function Component() {
			const selectedDateMin3DaysDifference = () => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			};
		}
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi());

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });

    it("should remove memo", () => {
      const input = `
		import { memo } from 'react';

		const MyComponent = ({ name }) => {
			return <div>Hello, {name}!</div>;
		  };
		  
		const MemoizedMyComponent = memo(MyComponent);
		`;

      const output = `
		const MyComponent = ({ name }) => {
			return <div>Hello, {name}!</div>;
		  };
		  
		const MemoizedMyComponent = MyComponent;
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi());

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });

    it("should remove React.useMemo, React.useCallback, React.memo", () => {
      const input = `
		import React from 'react';

		function Component() {
			const state = React.useState();

			const example1 = React.useMemo(() => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			}, [today, selectedDate]);

			const example2 = React.useCallback(() => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			}, [today, selectedDate]);
		}

		const MyComponent = ({ name }) => {
			return <div>Hello, {name}!</div>;
		  };
		  
		const MemoizedMyComponent = React.memo(MyComponent);
		`;

      const output = `
		import React from 'react';

		function Component() {
			const state = React.useState();

			const example1 = () => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			};

			const example2 = () => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			};
		}

		const MyComponent = ({ name }) => {
			return <div>Hello, {name}!</div>;
		  };
		  
		const MemoizedMyComponent = MyComponent;
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi());

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });
  });

  describe("typescript code", () => {
    it("should remove useCallback", () => {
      const input = `
		import { useCallback } from 'react';

		function Component({ url }: { url: string }) {
			const selectedDateMin3DaysDifference = useCallback(() => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			  }, [today, selectedDate]);
		}
		`;

      const output = `
		function Component({ url }: { url: string }) {
			const selectedDateMin3DaysDifference = () => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			};
		}
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi());

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });

    it("should remove useMemo", () => {
      const input = `
		import { useMemo } from 'react';

		function Component({ url }: { url: string }) {
			const selectedDateMin3DaysDifference = useMemo(() => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			  }, [today, selectedDate]);
		}
		`;

      const output = `
		function Component({ url }: { url: string }) {
			const selectedDateMin3DaysDifference = () => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			};
		}
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi());

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });

    it("should remove memo", () => {
      const input = `
		import { memo, type ReactNode } from 'react';

		const MyComponent = ({ name } : { name: string }) => {
			return <div>Hello, {name}!</div>;
		  };
		  
		const MemoizedMyComponent: ReactNode = memo(MyComponent);
		`;

      const output = `
		import { type ReactNode } from 'react';

		const MyComponent = ({ name } : { name: string }) => {
			return <div>Hello, {name}!</div>;
		  };
		  
		const MemoizedMyComponent: ReactNode = MyComponent;
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi());

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });

    it("should remove React.useMemo, React.useCallback, React.memo", () => {
      const input = `
		import React from 'react';

		function Component({ url }: { url: string }) {
			const state = React.useState<string>();

			const example1 = React.useMemo(() => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			}, [today, selectedDate]);

			const example2 = React.useCallback(() => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			}, [today, selectedDate]);
		}

		const MyComponent = ({ name } : { name: string }) => {
			return <div>Hello, {name}!</div>;
		  };
		  
		const MemoizedMyComponent: React.ReactNode = React.memo(MyComponent);
		`;

      const output = `
		import React from 'react';

		function Component({ url }: { url: string }) {
			const state = React.useState<string>();

			const example1 = () => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			};

			const example2 = () => {
				const diff = today.diff(selectedDate, "days");
				return diff > 3 || diff < -3;
			};
		}

		const MyComponent = ({ name } : { name: string }) => {
			return <div>Hello, {name}!</div>;
		  };
		  
		const MemoizedMyComponent: React.ReactNode = MyComponent;
		`;

      const fileInfo: FileInfo = {
        path: "index.ts",
        source: input,
      };

      const actualOutput = transform(fileInfo, buildApi());

      assert.deepEqual(
        actualOutput?.replace(/\W/gm, ""),
        output.replace(/\W/gm, ""),
      );
    });
  });
});
