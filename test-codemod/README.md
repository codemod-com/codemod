# test-codemod

a simple test codemod

## Installation

```bash
# Install from registry
codemod run test-codemod

# Or run locally
codemod run -w workflow.yaml
```

## Usage

This codemod transforms javascript code by:

- Converting `var` declarations to `const`/`let`
- Removing debug statements
- Modernizing syntax patterns

## Development

```bash
# Test the transformation
ast-grep test rules/

# Validate the workflow
codemod validate -w workflow.yaml

# Publish to registry
codemod login
codemod publish
```

## License

MIT 