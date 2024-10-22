import { describe, it } from 'vitest';
import jscodeshift, { type API } from 'jscodeshift';
import transform from '../src/index.js';
import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

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

describe('vue/3/add-script-setup-and-update-calendar-components', () => {
  it('test #1', async () => {
    const INPUT = await readFile(join(__dirname, '..', '__testfixtures__/fixture1.input.ts'), 'utf-8');
    const OUTPUT = await readFile(join(__dirname, '..', '__testfixtures__/fixture1.output.ts'), 'utf-8');

    const actualOutput = transform({
        path: 'index.js',
        source: INPUT,
      },
      buildApi('tsx'), {}
    );

    assert.deepEqual(
      actualOutput?.replace(/W/gm, ''),
      OUTPUT.replace(/W/gm, ''),
    );
  });
});