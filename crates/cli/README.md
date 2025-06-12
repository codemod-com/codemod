# Butterflow CLI

The Butterflow CLI is a command-line interface for running and managing Butterflow workflows - a lightweight, self-hostable workflow engine designed for running large-scale code transformation jobs.

## Installation

### Building from Source

```bash
# Clone the repository
git clone https://github.com/codemod-com/butterflow.git
cd butterflow

# Build the project
cargo build --release

# The executable will be available at target/release/butterflow
```

## Quick Start

1. Create a workflow file `workflow.yaml`:

```yaml
version: "1"
nodes:
  - id: hello-world
    name: Hello World
    type: automatic
    runtime:
      type: direct
    steps:
      - id: hello
        name: Say Hello
        run: echo "Hello, World!"
```

2. Run the workflow:

```bash
butterflow run -w workflow.yaml
```

## Commands

### `butterflow init`

Initialize a new Butterflow workflow project with interactive setup:

```bash
# Initialize a new project in current directory
butterflow init

# Initialize a new project in a specific directory
butterflow init my-project/

# Initialize with a specific name
butterflow init --name my-workflow
```

**Options:**
- `--name <NAME>`: Set the project name (defaults to directory name)
- `--force`: Overwrite existing files if they exist
- Positional argument: Target directory path (defaults to current directory)

**Interactive Setup:**

The init command will prompt you with several questions to customize your project:

1. **Project Type Selection:**
   ```
   ? What type of workflow would you like to create?
   ❯ AST-grep with JavaScript/TypeScript rules
     AST-grep with YAML rules  
     Blank workflow (custom commands)
   ```

2. **Language Selection** (if AST-grep is chosen):
   ```
   ? Which language would you like to target?
   ❯ JavaScript/TypeScript
     Python
     Rust
     Go
     Java
     C/C++
     Other
   ```

3. **Project Configuration:**
   ```
   ? Project name: my-codemod
   ? Description: Converts legacy API calls to new format
   ? Author: Your Name <your.email@example.com>
   ```

**Generated Project Structure:**

Depending on your selections, the init command creates different project templates:

#### AST-grep JavaScript Project
```
my-codemod/
├── workflow.yaml           # Main workflow definition
├── package.json           # Node.js dependencies
├── rules/
│   └── example-rule.js    # JavaScript AST transformation rules
├── scripts/
│   └── apply-codemod.js   # Script to apply transformations
├── tests/
│   ├── input/             # Test input files
│   └── expected/          # Expected output files
└── README.md              # Project documentation
```

#### AST-grep YAML Project
```
my-codemod/
├── workflow.yaml          # Main workflow definition
├── rules/
│   └── example-rule.yml   # YAML AST pattern rules
├── scripts/
│   └── apply-rules.sh     # Shell script to apply rules
├── tests/
│   ├── input/             # Test input files
│   └── expected/          # Expected output files
└── README.md              # Project documentation
```

#### Blank Workflow Project
```
my-workflow/
├── workflow.yaml          # Basic workflow template
├── scripts/
│   └── example.sh         # Example script
└── README.md              # Project documentation
```

**Example Usage:**

```bash
# Create a new AST-grep JavaScript project
$ butterflow init my-js-codemod
? What type of workflow would you like to create? AST-grep with JavaScript/TypeScript rules
? Which language would you like to target? JavaScript/TypeScript
? Project name: my-js-codemod
? Description: Migrate from React class components to hooks
? Author: John Doe <john@example.com>

✓ Created workflow.yaml
✓ Created package.json with @ast-grep/cli dependency
✓ Created rules/migrate-to-hooks.js
✓ Created scripts/apply-codemod.js
✓ Created test structure
✓ Created README.md

Next steps:
  cd my-js-codemod
  npm install
  butterflow validate -w workflow.yaml
  butterflow run -w workflow.yaml
```

### `butterflow run`

Execute a workflow from various sources:

```bash
# Run from a specific workflow file
butterflow run -w workflow.yaml
butterflow run -w path/to/workflow.yaml

# Run from a workflow bundle directory (containing workflow.yaml)
butterflow run ./my-workflow-bundle/

# Run from a registry (Conceptual)
# butterflow run my-registry/react-19-codemods:latest 
```

**Options:**
- `-w, --workflow <FILE>`: Path to the workflow definition file
- Positional argument: Path to workflow file or bundle directory

### `butterflow resume`

Resume a paused workflow or trigger manual tasks:

```bash
# Resume a workflow run by ID
butterflow resume -i <workflow-run-id>

# Trigger a specific task by UUID
butterflow resume -i <workflow-run-id> -t <task-uuid>

# Trigger all tasks currently awaiting manual triggers
butterflow resume -i <workflow-run-id> --trigger-all
```

**Options:**
- `-i, --id <UUID>`: Workflow run ID to resume
- `-t, --task <UUID>`: Specific task UUID to trigger
- `--trigger-all`: Trigger all tasks in `AwaitingTrigger` state

### `butterflow validate`

Validate a workflow definition without executing it:

```bash
# Validate a workflow file
butterflow validate -w workflow.yaml
butterflow validate -w path/to/workflow.yaml

# Validate a workflow bundle
butterflow validate ./my-workflow-bundle/
```

**Validation Checks:**
- Schema validation
- Node ID uniqueness
- Step ID uniqueness within nodes  
- Template ID uniqueness
- Dependency validation
- Cyclic dependency detection
- Template reference validation
- Matrix strategy validation
- State schema validation
- Variable reference syntax validation

**Example Output:**

Valid workflow:
```bash
$ butterflow validate -w valid-workflow.yaml
✓ Workflow definition is valid
Schema validation: Passed
Node dependencies: Valid (3 nodes, 2 dependency relationships)
Template references: Valid (2 templates, 3 references)
Matrix strategies: Valid (1 matrix node)
State schema: Valid (2 schema definitions)
```

Invalid workflow:
```bash
$ butterflow validate -w invalid-workflow.yaml
✗ Workflow definition is invalid
Error at nodes[2].strategy: Matrix strategy requires 'values' or 'from_state' property
Error at nodes[1].depends_on[0]: Referenced node 'non-existent-node' does not exist
Error: Cyclic dependency detected: node-a → node-b → node-a
```

### `butterflow login`

Authenticate with a Butterflow registry to publish and manage codemods:

```bash
# Login to the default registry
butterflow login

# Login to a specific registry
butterflow login --registry https://registry.example.com

# Login with a token (for CI/CD)
butterflow login --token <your-token>

# Login with username/password
butterflow login --username <username>
```

**Options:**
- `--registry <URL>`: Registry URL (defaults to official Butterflow registry)
- `--token <TOKEN>`: Authentication token (for non-interactive login)
- `--username <USERNAME>`: Username for interactive login
- `--scope <SCOPE>`: Organization or user scope for publishing

**Interactive Login:**

```bash
$ butterflow login
? Registry URL: https://registry.butterflow.com (default)
? Username: john.doe
? Password: ********
? Organization (optional): my-org
✓ Successfully logged in as john.doe
✓ Default publish scope set to @my-org
```

**Token-based Login (for CI/CD):**

```bash
# Set authentication token
export BUTTERFLOW_TOKEN="your-registry-token"
butterflow login --token $BUTTERFLOW_TOKEN
```

### `butterflow publish`

Publish a codemod to a registry for sharing and reuse:

```bash
# Publish current directory as a codemod
butterflow publish

# Publish a specific codemod directory
butterflow publish ./my-codemod/

# Publish with specific version
butterflow publish --version 1.2.3

# Publish to specific registry
butterflow publish --registry https://registry.example.com

# Dry run (validate without publishing)
butterflow publish --dry-run
```

**Options:**
- `--version <VERSION>`: Explicit version (overrides manifest version)
- `--registry <URL>`: Target registry URL
- `--tag <TAG>`: Tag for the release (e.g., `beta`, `latest`)
- `--access <LEVEL>`: Access level (`public` or `private`)
- `--dry-run`: Validate and pack without uploading
- `--force`: Override existing version (use with caution)

**Publishing Flow:**

```bash
$ butterflow publish
✓ Validating codemod.yaml manifest
✓ Validating workflow.yaml
✓ Running tests (if present)
✓ Building codemod bundle
✓ Uploading to registry @my-org/react-hooks-migration@1.0.0
✓ Published successfully!

Install with: butterflow run @my-org/react-hooks-migration@1.0.0
```

## Codemod Manifest Standard

Published codemods must include a `codemod.yaml` manifest file that defines metadata, dependencies, and publishing information.

### Manifest Schema

```yaml
# codemod.yaml
name: react-hooks-migration
version: 1.0.0
description: Migrates React class components to functional components with hooks
author: John Doe <john@example.com>
license: MIT
repository: https://github.com/user/react-hooks-migration

registry:
  access: public

targets:
  languages:
    - javascript
    - typescript
  frameworks:
    - react
  versions:
    react: ">=16.8.0"
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Codemod package name (must be unique in scope) |
| `version` | string | Semantic version (e.g., "1.0.0") |
| `description` | string | Brief description of what the codemod does |
| `author` | string | Author name and email |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `license` | string | License identifier (e.g., "MIT", "Apache-2.0") |
| `repository` | string | Repository URL for the codemod source code |
| `registry.access` | string | Access level: "public" or "private" |
| `targets.languages` | array | Supported programming languages |
| `targets.frameworks` | array | Supported frameworks or libraries |
| `targets.versions` | object | Version constraints for frameworks |

### Publishing Examples

#### Basic Codemod

```yaml
name: remove-console-logs
version: 1.0.0
description: Removes console.log statements from JavaScript/TypeScript files
author: Developer <dev@example.com>
license: MIT
repository: https://github.com/dev/remove-console-logs

targets:
  languages: [javascript, typescript]
```

#### Framework-Specific Codemod

```yaml
name: api-migration-v2
version: 2.1.0
description: Migrates legacy API calls to new v2 endpoints
author: API Team <api-team@company.com>
license: Apache-2.0
repository: https://github.com/company/api-migration-v2

registry:
  access: private

targets:
  languages: [javascript, typescript]
  frameworks: [react, vue, angular]
  versions:
    react: ">=16.0.0"
    vue: ">=3.0.0"
```

## Workflow Sources

The CLI supports loading workflows from different sources:

### File Path
```bash
butterflow run -w path/to/your/workflow.yaml
```
Loads the specific file. The base path for execution is the directory containing this file.

### Directory Path (Bundle)
```bash
butterflow run path/to/your/bundle/
```
Butterflow looks for a standard workflow file (e.g., `workflow.yaml`) inside this directory. The base path for execution is this directory.

### Registry Identifier
```bash
# Install and run a published codemod
butterflow run @my-org/react-hooks-migration@1.0.0

# Run latest version
butterflow run @my-org/react-hooks-migration@latest

# Run with custom parameters
butterflow run @my-org/api-migration-v2@2.1.0 --param api_base_url=https://staging-api.example.com
```

When running from a registry, Butterflow:
1. Downloads the codemod bundle from the registry
2. Caches it locally for faster subsequent runs
3. Validates the manifest and workflow
4. Executes with the bundle directory as the base path

## Workflow Bundles

A workflow bundle is a directory containing:
1. The main workflow definition file (e.g., `workflow.yaml`)
2. Any scripts, binaries, or configuration files referenced by the workflow steps
3. Additional assets needed by the tasks

When running from a directory, Butterflow uses that directory as the root for resolving relative paths during execution.

## Runtime Execution

### Container Runtimes

The CLI supports multiple execution runtimes:

- **Docker**: Uses Docker daemon for container execution
- **Podman**: Uses Podman for container execution  
- **Direct**: Runs commands directly on the host machine

When using `runtime: direct`, commands execute with the same working directory as the `butterflow` CLI invocation. Use the `$CODEMOD_PATH` environment variable to access files within the workflow bundle.

### Environment Variables

The CLI provides several environment variables to running tasks:

- `$STATE_OUTPUTS`: File descriptor for writing state updates
- `$CODEMOD_PATH`: Absolute path to the workflow bundle root (for `direct` runtime)
- `$BUTTERFLOW_STATE`: Path to state file for programmatic access

## Manual Triggers and Resumption

### Manual Nodes

Nodes with `type: manual` or `trigger: { type: manual }` will pause execution and await manual triggers:

```yaml
nodes:
  - id: deploy-prod
    name: Deploy to Production
    type: automatic
    trigger:
      type: manual  # Requires manual approval
    steps:
      - id: deploy
        run: ./deploy.sh production
```

### Triggering Manual Tasks

When a workflow pauses for manual triggers:

1. The workflow state is persisted with tasks marked `AwaitingTrigger`
2. The CLI provides task UUIDs for manual triggering
3. Use `butterflow resume` to trigger specific tasks or all awaiting tasks

```bash
# Trigger specific deployment task
butterflow resume -i abc123-workflow-run-id -t def456-task-uuid

# Trigger all awaiting tasks and continue
butterflow resume -i abc123-workflow-run-id --trigger-all
```

## Error Handling

### Automatic Validation

Validation is performed automatically when running workflows:

```bash
$ butterflow run -w invalid-workflow.yaml
✗ Workflow definition is invalid
Error: Cyclic dependency detected: node-a → node-b → node-a
Workflow execution aborted
```

### Resume After Failures

If a workflow fails or is interrupted:

1. The state is automatically persisted
2. Use `butterflow resume` to continue from the last checkpoint
3. Failed tasks can be retried while preserving completed work

## Examples

### Basic Workflow Execution

```bash
# Create and run a simple workflow
cat > hello.yaml << EOF
version: "1"
nodes:
  - id: greet
    name: Greeting
    type: automatic
    runtime:
      type: direct
    steps:
      - id: hello
        run: echo "Hello from Butterflow!"
EOF

butterflow run -w hello.yaml
```

### Matrix Workflow with Manual Approval

```bash
# Run matrix workflow requiring manual triggers
butterflow run -w deploy-workflow.yaml

# When paused, trigger specific environments
butterflow resume -i <run-id> -t <staging-task-uuid>
butterflow resume -i <run-id> -t <prod-task-uuid>
```

### Workflow Validation and Publishing

```bash
# Validate before running
butterflow validate -w complex-workflow.yaml

# Run if validation passes
butterflow run -w complex-workflow.yaml

# Login to registry and publish a codemod
butterflow login
butterflow publish ./my-codemod/

# Run published codemod
butterflow run @my-org/my-codemod@1.0.0
```

### Publishing Workflow

```bash
# Create and publish a new codemod
butterflow init my-api-migration
cd my-api-migration

# Develop and test your codemod
# ... edit workflow.yaml, add rules, scripts, etc.

# Create manifest
cat > codemod.yaml << EOF
name: my-api-migration  
version: 1.0.0
description: Migrates legacy API calls
author: Developer <dev@example.com>
workflow: workflow.yaml
targets:
  languages: [javascript, typescript]
EOF

# Validate and publish
butterflow validate
butterflow publish --dry-run  # Preview
butterflow publish           # Publish to registry
```

## Global Options

Most commands support these global options:

- `--help, -h`: Show help information
- `--version, -V`: Show version information
- `--verbose, -v`: Enable verbose output
- `--quiet, -q`: Suppress non-essential output

For detailed help on any command, use:

```bash
butterflow <command> --help
```
