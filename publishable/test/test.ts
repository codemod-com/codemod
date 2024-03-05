import { describe, it } from 'vitest';
import jscodeshift, { API } from 'jscodeshift';
import transform from '../src/index.js';
import assert from 'node:assert';

const buildApi = (parser: string | undefined): API => ({
  j: parser ? jscodeshift.withParser(parser) : jscodeshift,
  jscodeshift: parser ? jscodeshift.withParser(parser) : jscodeshift,
  stats: () => {
    console.error(
      'The stats function was called, which is not supported on purpose',
    );
  },
  report: () => {
    console.error(
      'The report function was called, which is not supported on purpose',
    );
  },
});

describe('', function() {
  it('should do the thing', function() {
    const INPUT = `
        import { useContext } from "react";
        import ThemeContext from "./ThemeContext";

        const theme = useContext(ThemeContext);
              `;

    const OUTPUT = `
        import { use } from "react";
        import ThemeContext from "./ThemeContext";

        const theme = use(ThemeContext);
              `;

    const actualOutput = transform({
        path: 'index.js',
        source: INPUT,
      },
      buildApi('tsx'),
    );

    assert.deepEqual(
      actualOutput?.replace(/W/gm, ''),
      OUTPUT.replace(/W/gm, ''),
    );
  });
});