# codemod

## 0.16.0

### Minor Changes

- d8c7c67: Fixed issues with the Codemod CLI, including resolving the build failure on the publish command, removing automatic dependency installation during the init command, fixing .gitignore in package-boilerplate.ts, and removing the LICENSE file from the boilerplate list.

## 0.15.0

### Minor Changes

- b0dae1b: Add API keys functionality

### Patch Changes

- 006e9f8: Fixed fallback in case keytar cannot be used (fixes issue with authorization in headless environment)

## 0.14.2

### Patch Changes

- bf840a4: Clearer instructions for running a recipe with some codemods using the CLI.

## 0.14.1

### Patch Changes

- b677d74: Support exported parser variable from the codemod file, include esm/cjs -specific file extensions to included patterns

## 0.14.0

### Minor Changes

- daea47d: add support for ESM

### Patch Changes

- 6497280: pass engine while executing run
  - @codemod.com/workflow@0.0.31

## 0.13.11

### Patch Changes

- c78ebc5: handles execution error when file path could not be read from
- 29cbaa3: stdout noop bugfix
