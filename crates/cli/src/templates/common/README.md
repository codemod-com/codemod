# {name}

{description}

## Installation

```bash
# Install from registry
codemod run {name}

# Or run locally
codemod run -w workflow.yaml
```

## Usage

This codemod transforms {language} code by:

- Converting `var` declarations to `const`/`let`
- Removing debug statements
- Modernizing syntax patterns

## Development

```bash
# Test the transformation
{test_command}

# Validate the workflow
codemod validate -w workflow.yaml

# Publish to registry
codemod login
codemod publish
```

## License

{license} 