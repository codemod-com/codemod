# Butterflow: A Self-Hostable Workflow Engine

Butterflow is a lightweight, self-hostable workflow engine designed for running large-scale code transformation jobs. Similar to GitHub Actions but with a focus on local execution and code transformations like codemods and grep operations.

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
      - name: Say Hello
        run: echo "Hello, World!"
```

2. Run the workflow:

```bash
butterflow run -w workflow.yaml
```

## Core Features

- **Self-hostable**: Run workflows on your own infrastructure
- **Local execution**: Execute workflows on your local machine
- **Lightweight**: Minimal resource requirements
- **Parallel execution**: Run nodes concurrently when dependencies allow
- **Manual triggers**: Some nodes can be manually triggered
- **Matrix execution**: Run the same node multiple times with different inputs
- **OCI container support**: Each task runs in its own container
- **Durable execution**: Workflow state is persisted with diff-based updates and can survive restarts
- **Flexible configuration**: Define workflows in either JSON or YAML format
- **Backend-agnostic state management**: Support for multiple state backends (local, API, database)
- **Resumable workflows**: Resume workflow execution from the last saved state
- **Reusable templates**: Define reusable workflow components
- **State schema definition**: Define the structure of workflow state

## Architecture

Butterflow consists of several components:

1. **Workflow Engine**: Orchestrates the execution of workflows
2. **Task Runner**: Executes individual tasks using container runtimes
3. **State Manager**: Persists workflow state for durability with support for multiple backends
4. **Scheduler**: Determines which nodes can be executed based on dependencies
5. **State Synchronizer**: Manages state updates using diff-based synchronization
6. **Template Manager**: Manages reusable workflow templates

## Workflow Definition

Workflows can be defined in either JSON or YAML format. The engine automatically detects the format based on the file extension or attempts to parse both formats if the extension is not recognized.

### YAML Format

```yaml
version: "1"

state:
  schema:
    - name: i18nShardsTs
      type: array
      items:
        type: object
        properties:
          team:
            type: string
          shardId:
            type: string

templates:
  - id: checkout-repo
    name: Checkout Repository
    description: Standard process for checking out a repository
    runtime:
      type: docker
      image: alpine/git:latest
    inputs:
      - name: repo_url
        type: string
        required: true
        description: "URL of the repository to checkout"
        default: ${{params.repo_url}}
    steps:
      - name: Clone repository
        run: git clone ${{inputs.repo_url}} repo

nodes:
  - id: evaluate-codeowners
    name: Evaluate codeowners
    description: Shard the Codemod run into smaller chunks based on the codeowners
    type: automatic
    runtime:
      type: docker
      image: node:18-alpine
    steps:
      - name: Checkout repo
        use:
          template: checkout-repo
          inputs:
            repo_url: ${{params.repo_url}}

  - id: run-codemod-ts
    name: I18n Codemod (TS)
    description: Run the i18n codemod on the TS files
    type: automatic
    trigger:
      type: manual
    depends_on:
      - evaluate-codeowners
    strategy:
      type: matrix
      from_state: i18nShardsTs
```

### Workflow Components

#### State Schema

The `state` section defines the schema for workflow state:

```yaml
state:
  schema:
    - name: stateName
      type: array|object|string|number|boolean
      items: # For array types
        type: object
        properties:
          property1:
            type: string
```

#### Templates

Templates are reusable workflow components:

```yaml
templates:
  - id: template-id
    name: Template Name
    description: Template description
    runtime:
      type: docker
      image: image:tag
    inputs:
      - name: input_name
        type: string|number|boolean
        required: true|false
        description: "Input description"
        default: default_value
    steps:
      - name: Step name
        run: |
          command1
      - name: Second step name
        run: |
          command2
    outputs:
      - name: output_name
        value: "output_value"
```

#### Nodes

Nodes are the main execution units in a workflow:

```yaml
nodes:
  - id: node-id
    name: Node Name
    description: Node description
    type: automatic|manual
    trigger:
      type: manual|automatic
    depends_on:
      - other-node-id
    runtime:
      type: docker
      image: image:tag
    strategy:
      type: matrix
      from_state: stateName
    steps:
      - name: Step name
        use:
          template: template-id
          inputs:
            input_name: value
      - name: Another step
        run: command1
    env:
      ENV_VAR: value
```

### Node Configuration

Each node in a workflow can have the following properties:

| Property      | Description                                                   |
| ------------- | ------------------------------------------------------------- |
| `id`          | Unique identifier for the node                                |
| `name`        | Human-readable name                                           |
| `description` | Detailed description of what the node does                    |
| `type`        | Either "automatic" or "manual"                                |
| `depends_on`  | Array of node IDs that must complete before this node can run |
| `strategy`    | Configuration for running multiple instances of this node     |
| `trigger`     | Configuration for how the node is triggered                   |
| `runtime`     | Container runtime configuration                               |
| `steps`       | Array of steps to execute within the node                     |
| `env`         | Environment variables to inject into the container            |

### Step Configuration

Steps within a node can have the following properties:

| Property      | Description                                |
| ------------- | ------------------------------------------ |
| `id`          | Unique identifier for the step             |
| `name`        | Human-readable name                        |
| `description` | Detailed description of what the step does |
| `uses`        | Template to use for this step              |
| `run`         | Command to run                             |

## Node vs Task

In Butterflow:

- A **Node** is part of the workflow definition - it's a static component defined in your workflow YAML/JSON
- A **Task** is a runtime instance of a node that is executed - it's created dynamically during workflow execution

This distinction is particularly important in two scenarios:

1. **Matrix Strategies**: When a node uses a matrix strategy, multiple tasks are created from a single node definition - one for each combination in the matrix. Each task has its own unique UUID v4, status, and state.

2. **Manual Triggers**: When a node requires manual triggering (either because it's a manual node type or has a manual trigger configuration), the workflow engine creates the task(s) for that node, marks them as `AwaitingTrigger`, and then provides the specific task UUIDs to the user. This allows users to trigger individual tasks rather than entire nodes.

When a task is executed, it will run all the steps defined in its associated node. Tasks are always identified by UUID v4s to ensure uniqueness and proper tracking throughout the workflow execution.

### Task Creation and Management

Tasks are created as soon as the workflow runner has determined what needs to be executed next. This is particularly important for proper dependency tracking and execution planning:

- **Regular nodes**: A single task is created for each regular node
- **Matrix nodes**: For matrix nodes, multiple tasks are created:
  - One "master task" that represents the overall state of the node
  - Individual tasks for each matrix combination

The master task for a matrix node is not runnable itself - it exists solely to track the collective status of all matrix combination tasks. For example, if a matrix node has 10 combinations, the system will create 11 tasks: 1 master task plus 10 individual combination tasks.

If the matrix input is not yet available (e.g., it depends on the output of a previous node), no tasks will be created for that node, and all dependencies of that node will be marked as blocked until the matrix input becomes available.

### Example: Matrix Node with Master Task

Consider a matrix node that processes different regions:

```yaml
nodes:
  - id: process-regions
    name: Process Regions
    type: automatic
    strategy:
      type: matrix
      values:
        - region: us-east
        - region: us-west
        - region: eu-central
    # ...
```

When this workflow runs, it will:
1. Create a master task with a UUID v4 (e.g., `123e4567-e89b-12d3-a456-426614174000`)
2. Create three individual tasks with unique UUID v4s (e.g., 
   - `123e4567-e89b-12d3-a456-426614174001`
   - `123e4567-e89b-12d3-a456-426614174002`
   - `123e4567-e89b-12d3-a456-426614174003`)
3. Track the overall status via the master task
4. Execute each individual task according to the workflow rules

The master task's status is derived from its child tasks:
- If all child tasks are `Completed`, the master task is `Completed`
- If any child task is `Failed`, the master task is `Failed`
- If some child tasks are `Running` and none have `Failed`, the master task is `Running`

## Workflow vs Workflow Run

It's important to distinguish between a workflow and a workflow run:

- A **Workflow** is the definition of the process - the YAML/JSON file that describes nodes, dependencies, and execution rules
- A **Workflow Run** is a specific execution instance of a workflow - created when a user initiates the workflow

Each workflow run is assigned a unique UUID v4 identifier that distinguishes it from other runs of the same workflow.

### Key Differences

| Workflow | Workflow Run |
| -------- | ------------ |
| Static definition | Runtime instance with UUID v4 identifier |
| Defined in YAML/JSON | Created when workflow is executed |
| Contains node definitions | Contains task instances with UUID v4s |
| No state | Has associated state |

### State Management in Workflow Runs

Each workflow run has its own state that includes:

- A copy of the original workflow definition
- Current status of all tasks
- All resolved variables and parameters
- Execution history and logs
- Matrix configurations and generated tasks

This state is tied specifically to the workflow run UUID, not to the workflow definition itself. This means multiple runs of the same workflow will each have their own independent state.

## Variable Resolution

Butterflow supports a powerful variable resolution system using the `${{...}}` syntax. This allows you to reference parameters, environment variables, and state values throughout your workflow definition.

### Variable Types

- **Parameters** (*TODO*): Accessed with `${{params.name}}` - values passed when starting the workflow
- **Environment Variables**: Accessed with `${{env.NAME}}` - environment variables from the execution environment
- **State Values**: Accessed with `${{state.name}}` - values stored in the workflow state
- **Task Outputs**: Accessed with `${{tasks.node_id.outputs.name}}` - outputs from previous tasks
- **Matrix Values**: In matrix tasks, matrix values are directly accessible as variables

### Variable Resolution Examples

```yaml
nodes:
  - id: example-node
    name: "Processing ${{params.repo_name}}"
    description: "Running on branch ${{params.branch}}"
    env:
      REPO_URL: "${{params.repo_url}}"
      DEBUG: "${{env.CI}}"
      PREVIOUS_RESULT: "${{tasks.previous-node.outputs.result}}"
    steps:
      - name: Process Data
        run: echo "Processing data for ${{params.repo_name}}"
```

In matrix nodes, the matrix values are directly accessible in commands:

```yaml
nodes:
  - id: process-regions
    strategy:
      type: matrix
      values:
        - region: us-east
          zone: zone-1
        - region: us-west
          zone: zone-2
    steps:
      - run: echo "Processing region $region in zone $zone"
```

### Variable Resolution Order

Variables are resolved in the following order:

1. Matrix values (for matrix tasks)
2. Parameters passed to the workflow run
3. Environment variables
4. State values
5. Task outputs from completed tasks

If a variable cannot be resolved, the workflow engine will either:
- Use a default value if specified
- Fail with an error if the variable is required and no default is provided

### Example: Workflow with Parameters

When running a workflow with parameters:

```bash
butterflow run -w workflow.yaml --param repo_url=https://github.com/example/repo --param branch=main
```

This will generate a UUID v4 for the workflow run, which you can use to reference this specific execution later.

### Example: Matrix Node with Manual Trigger

Consider a node with a matrix strategy that generates 3 tasks, and requires manual triggering:

```yaml
nodes:
  - id: process-regions
    name: Process Regions
    type: automatic
    trigger:
      type: manual
    strategy:
      type: matrix
      values:
        - region: us-east
        - region: us-west
        - region: eu-central
    # ...
```

When this workflow runs, it will:
1. Create three distinct tasks with unique UUID v4s
2. Mark each task as `AwaitingTrigger`
3. Provide these specific task UUIDs to the user

The user can then choose to trigger individual tasks:
```bash
# Trigger a specific task using its UUID
butterflow resume -i 123e4567-e89b-12d3-a456-426614174000 -t 123e4567-e89b-12d3-a456-426614174001
```

Or trigger all awaiting tasks:
```bash
# Trigger all awaiting tasks
butterflow resume -i 123e4567-e89b-12d3-a456-426614174000 --trigger-all
```

This granular control allows for more flexible workflow execution, especially in complex scenarios where different parts of a matrix might need to be triggered by different users or at different times.

### Task Status Tracking

During workflow execution, each task (node instance) can have one of the following statuses:

| Status | Description |
| ------ | ----------- |
| `Pending` | Task hasn't started execution yet |
| `Running` | Task is currently being executed |
| `Completed` | Task has completed successfully |
| `Failed` | Task execution failed with an error |
| `AwaitingTrigger` | Task is waiting for a manual trigger |
| `Blocked` | Task is blocked by dependencies |
| `WontDo` | Task will not be executed (typically happens when re-running a workflow where matrix inputs have changed) |

The workflow engine tracks these statuses in the state backend, allowing for:
- Resuming workflows after interruptions
- Visualizing workflow progress
- Identifying bottlenecks or failures
- Supporting partial re-runs of workflows

For matrix nodes, each generated task has its own status, enabling fine-grained tracking of execution progress.

### Manual Nodes and Triggers

Butterflow supports two types of manual intervention in workflows:

1. **Manual node type**: When a node is defined with `type: manual`, it will always pause execution and wait for a manual trigger, even if all dependencies are satisfied. Manual nodes allow you to insert human verification or decision points in your workflow.

2. **Manual trigger**: Nodes defined with `trigger: { type: manual }` will pause execution until explicitly triggered, even if they're automatic nodes. This is useful for creating approval gates or scheduling specific parts of a workflow.

When a workflow encounters a manual node or a node with a manual trigger, it:

1. Pauses execution of that branch of the workflow
2. Marks the node as `AwaitingTrigger`
3. Continues executing other branches that aren't blocked
4. Persists the workflow state so it can be resumed later

Resuming a workflow with manual nodes:

```bash
# Trigger a specific node and resume
butterflow resume -i workflow-run-id -t task-id

# Trigger all manual nodes and resume
butterflow resume -i workflow-run-id --trigger-all
```

When resumed, the workflow will continue execution from exactly where it left off, preserving all state and completed work.

## Container Execution

Each task runs in its own container. Butterflow supports multiple container runtimes:

- Docker: Uses the Docker daemon to run containers
- Podman: Uses Podman to run containers
- Direct: Runs commands directly on the host

## State Management

Butterflow implements a comprehensive backend-agnostic state management system:

- **Diff-based updates**: Only changes to the state are transmitted, reducing bandwidth and improving performance
- **Multiple backend support**: Store state in local files, databases, or remote APIs
- **API integration**: Send state diffs to external systems via API calls with retry mechanisms
- **Conflict resolution**: Smart merging of concurrent state updates
- **Transactional updates**: Ensure state consistency even during failures
- **State versioning**: Track changes to workflow state over time with version numbers
- **Schema validation**: Validate state against defined schemas
- **Local fallback**: API backends automatically fall back to local storage if remote is unavailable

The state management system tracks:

- Current status of each node/task
- Outputs from completed steps
- Matrix configurations and generated tasks
- Manual trigger status
- Execution history and logs

### State Persistence

Workflow state is persisted automatically during execution, allowing for:

- **Resume after interruptions**: If a workflow is stopped or crashes, it can resume from the last saved state
- **Periodic checkpoints**: State is saved at regular intervals during execution
- **Failure recovery**: If a node fails, the workflow can be retried from the failure point
- **Manual triggers**: State is saved when manual nodes are triggered
- **Efficient storage**: Only changes (diffs) are stored between saves, reducing storage requirements

### Transactional State Updates

Butterflow uses a diff-based approach for state updates, where the runner sends only the changes (diffs) to the state persistence adapter rather than the entire new state. This approach provides several key benefits:

- **Concurrent workflow execution**: Multiple users can run the same workflow for different tasks simultaneously without state updates interfering with each other
- **Atomic updates**: Each state change is applied as an atomic transaction, ensuring consistency
- **Reduced network traffic**: Only sending diffs significantly reduces the amount of data transferred
- **Conflict prevention**: Changes to different parts of the state can be applied independently
- **Audit trail**: The sequence of diffs provides a complete history of state changes

For example, if two different users are running the same workflow but working on different tasks:
1. User A updates the state of Task 1 from "Pending" to "Running"
2. User B updates the state of Task 2 from "Pending" to "Running"
3. The state persistence adapter receives these diffs separately and applies them sequentially
4. Both updates are preserved without overwriting each other

This transactional approach ensures that concurrent workflow executions remain isolated and don't interfere with each other's state, even when sharing the same workflow definition and state backend.

### State Backend Configuration

Create a `butterflow.config.yaml` file and supply it to the cli app as -c config.

```yaml
stateManagement:
  backend: "api" # Options: "local", "database", "api"
  apiConfig:
    endpoint: "https://api.example.com/workflow-state"
    authToken: "${{ENV_AUTH_TOKEN}}"
  retryConfig:
    maxRetries: 3
    backoffFactor: 1.5
```

## Usage Examples

### Running a Simple Workflow

```bash
$ butterflow run -w workflow.yaml --param repo_url=https://github.com/example/repo --param branch=main
Executing workflow...
[2023-06-15T10:30:45Z] Workflow started with ID: 123e4567-e89b-12d3-a456-426614174000
[2023-06-15T10:30:45Z] Task checkout-repo (123e4567-e89b-12d3-a456-426614174001): Running
[2023-06-15T10:31:15Z] Task checkout-repo (123e4567-e89b-12d3-a456-426614174001): Completed
[2023-06-15T10:31:15Z] Task evaluate-codeowners (123e4567-e89b-12d3-a456-426614174002): Running
[2023-06-15T10:32:30Z] Task evaluate-codeowners (123e4567-e89b-12d3-a456-426614174002): Completed
[2023-06-15T10:32:30Z] Created matrix tasks for run-codemod-ts:
  - Master task: 123e4567-e89b-12d3-a456-426614174003
  - Team frontend: 123e4567-e89b-12d3-a456-426614174004 (AwaitingTrigger)
  - Team backend: 123e4567-e89b-12d3-a456-426614174005 (AwaitingTrigger)
  - Team shared: 123e4567-e89b-12d3-a456-426614174006 (AwaitingTrigger)
[2023-06-15T10:32:30Z] Workflow paused: Manual triggers required

Workflow is awaiting manual triggers for the following tasks:
- 123e4567-e89b-12d3-a456-426614174004 (run-codemod-ts, team: frontend)
- 123e4567-e89b-12d3-a456-426614174005 (run-codemod-ts, team: backend)
- 123e4567-e89b-12d3-a456-426614174006 (run-codemod-ts, team: shared)

Use 'butterflow status -i 123e4567-e89b-12d3-a456-426614174000' to check status
Use 'butterflow resume -i 123e4567-e89b-12d3-a456-426614174000 --trigger-all' to trigger all tasks
```

The workflow run ID (123e4567-e89b-12d3-a456-426614174000) is generated automatically and will be needed for subsequent commands. Note that the command doesn't return until all automatically runnable tasks are completed or the workflow is paused due to manual triggers.

### Checking Workflow Status

```bash
$ butterflow status -i 123e4567-e89b-12d3-a456-426614174000
Workflow: simple-workflow (ID: 123e4567-e89b-12d3-a456-426614174000)
Status: AwaitingTrigger
Started: 2023-06-15T10:30:45Z
Duration: 00:05:23

Tasks:
- checkout-repo (123e4567-e89b-12d3-a456-426614174001): Completed
- evaluate-codeowners (123e4567-e89b-12d3-a456-426614174002): Completed
- run-codemod-ts (master) (123e4567-e89b-12d3-a456-426614174003): AwaitingTrigger
  - run-codemod-ts (team: frontend) (123e4567-e89b-12d3-a456-426614174004): AwaitingTrigger
  - run-codemod-ts (team: backend) (123e4567-e89b-12d3-a456-426614174005): AwaitingTrigger
  - run-codemod-ts (team: shared) (123e4567-e89b-12d3-a456-426614174006): AwaitingTrigger

Manual triggers required:
- 123e4567-e89b-12d3-a456-426614174004 (run-codemod-ts, team: frontend)
- 123e4567-e89b-12d3-a456-426614174005 (run-codemod-ts, team: backend)
- 123e4567-e89b-12d3-a456-426614174006 (run-codemod-ts, team: shared)
```

### Resuming a Workflow

When a workflow has tasks awaiting manual triggers, you can resume it by triggering specific tasks:

```bash
$ butterflow resume -i 123e4567-e89b-12d3-a456-426614174000 -t 123e4567-e89b-12d3-a456-426614174004
Resuming workflow 123e4567-e89b-12d3-a456-426614174000...
[2023-06-15T10:40:15Z] Task 123e4567-e89b-12d3-a456-426614174004 (run-codemod-ts, team: frontend) triggered
[2023-06-15T10:40:15Z] Task 123e4567-e89b-12d3-a456-426614174004 (run-codemod-ts, team: frontend): Running
[2023-06-15T10:42:30Z] Task 123e4567-e89b-12d3-a456-426614174004 (run-codemod-ts, team: frontend): Completed
[2023-06-15T10:42:30Z] Workflow paused: Manual triggers still required

Workflow is still awaiting manual triggers for the following tasks:
- 123e4567-e89b-12d3-a456-426614174005 (run-codemod-ts, team: backend)
- 123e4567-e89b-12d3-a456-426614174006 (run-codemod-ts, team: shared)
```

Or trigger all awaiting tasks at once:

```bash
$ butterflow resume -i 123e4567-e89b-12d3-a456-426614174000 --trigger-all
Resuming workflow 123e4567-e89b-12d3-a456-426614174000...
[2023-06-15T10:45:00Z] Triggering all awaiting tasks:
  - 123e4567-e89b-12d3-a456-426614174005 (run-codemod-ts, team: backend)
  - 123e4567-e89b-12d3-a456-426614174006 (run-codemod-ts, team: shared)
[2023-06-15T10:45:00Z] Task 123e4567-e89b-12d3-a456-426614174005 (run-codemod-ts, team: backend): Running
[2023-06-15T10:47:15Z] Task 123e4567-e89b-12d3-a456-426614174005 (run-codemod-ts, team: backend): Completed
[2023-06-15T10:47:15Z] Task 123e4567-e89b-12d3-a456-426614174006 (run-codemod-ts, team: shared): Running
[2023-06-15T10:49:30Z] Task 123e4567-e89b-12d3-a456-426614174006 (run-codemod-ts, team: shared): Completed
[2023-06-15T10:49:30Z] Task 123e4567-e89b-12d3-a456-426614174003 (run-codemod-ts master): Completed
[2023-06-15T10:49:30Z] All tasks completed successfully
[2023-06-15T10:49:30Z] Workflow completed
```

After all tasks are completed, you can check the final status:

```bash
$ butterflow status -i 123e4567-e89b-12d3-a456-426614174000
Workflow: simple-workflow (ID: 123e4567-e89b-12d3-a456-426614174000)
Status: Completed
Started: 2023-06-15T10:30:45Z
Completed: 2023-06-15T10:49:30Z
Duration: 00:18:45

Tasks:
- checkout-repo (123e4567-e89b-12d3-a456-426614174001): Completed
- evaluate-codeowners (123e4567-e89b-12d3-a456-426614174002): Completed
- run-codemod-ts (master) (123e4567-e89b-12d3-a456-426614174003): Completed
  - run-codemod-ts (team: frontend) (123e4567-e89b-12d3-a456-426614174004): Completed
  - run-codemod-ts (team: backend) (123e4567-e89b-12d3-a456-426614174005): Completed
  - run-codemod-ts (team: shared) (123e4567-e89b-12d3-a456-426614174006): Completed

Manual triggers required: None
```

### Validating a Workflow Definition

Before running a workflow, you can validate its definition:

```bash
$ butterflow validate -w workflow.yaml
✓ Workflow definition is valid
Schema validation: Passed
Node dependencies: Valid
Template references: Valid
```

If there are issues with the workflow definition:

```bash
$ butterflow validate -w invalid-workflow.yaml
✗ Workflow definition is invalid
Error at nodes[2].strategy: Matrix strategy requires 'values' or 'from_state' property
Error at nodes[1].depends_on[0]: Referenced node 'non-existent-node' does not exist
```

### Listing Workflow Runs

You can list all workflow runs:

```bash
$ butterflow list
Recent workflow runs:
- ID: 123e4567-e89b-12d3-a456-426614174000
  Name: simple-workflow
  Status: Completed
  Started: 2023-06-15T10:30:45Z
  Completed: 2023-06-15T10:49:30Z
  Duration: 00:18:45

- ID: 123e4567-e89b-12d3-a456-426614174010
  Name: matrix-workflow
  Status: Completed
  Started: 2023-06-14T15:20:30Z
  Completed: 2023-06-14T17:05:52Z
  Duration: 01:45:22

- ID: 123e4567-e89b-12d3-a456-426614174020
  Name: manual-workflow
  Status: Failed
  Started: 2023-06-13T09:10:15Z
  Failed: 2023-06-13T09:16:00Z
  Duration: 00:05:45
```

### Canceling a Workflow Run

If you need to stop a workflow run:

```bash
$ butterflow cancel -i 123e4567-e89b-12d3-a456-426614174000
Canceling workflow run 123e4567-e89b-12d3-a456-426614174000...
[2023-06-15T10:35:00Z] Sending termination signal to running tasks
[2023-06-15T10:35:02Z] Task 123e4567-e89b-12d3-a456-426614174004 (run-codemod-ts, team: frontend): Terminated
[2023-06-15T10:35:02Z] Task 123e4567-e89b-12d3-a456-426614174005 (run-codemod-ts, team: backend): Terminated
[2023-06-15T10:35:03Z] Workflow run canceled successfully
```

### Running with Custom Configuration

You can specify a custom configuration file:

```bash
$ butterflow run -w workflow.yaml -c butterflow.config.yaml --param repo_url=https://github.com/example/repo
Using configuration from butterflow.config.yaml
State backend: api (https://api.example.com/workflow-state)

Executing workflow...
[2023-06-16T09:15:30Z] Workflow started with ID: 123e4567-e89b-12d3-a456-426614174030
[2023-06-16T09:15:30Z] Task checkout-repo (123e4567-e89b-12d3-a456-426614174031): Running
[2023-06-16T09:16:00Z] Task checkout-repo (123e4567-e89b-12d3-a456-426614174031): Completed
[2023-06-16T09:16:00Z] Task evaluate-codeowners (123e4567-e89b-12d3-a456-426614174032): Running
[2023-06-16T09:17:15Z] Task evaluate-codeowners (123e4567-e89b-12d3-a456-426614174032): Completed
[2023-06-16T09:17:15Z] Created matrix tasks for run-codemod-ts:
  - Master task: 123e4567-e89b-12d3-a456-426614174033
  - Team frontend: 123e4567-e89b-12d3-a456-426614174034 (AwaitingTrigger)
  - Team backend: 123e4567-e89b-12d3-a456-426614174035 (AwaitingTrigger)
[2023-06-16T09:17:15Z] Workflow paused: Manual triggers required

Use 'butterflow status -i 123e4567-e89b-12d3-a456-426614174030' to check status
```

## Implementation Details

Butterflow is implemented in Rust with the following components:

- Core engine using async Rust with Tokio
- Backend-agnostic state management with diff-based synchronization
- API client for remote state management
- Persistent state storage using a local database
- CLI interface for user interaction
- Support for both JSON and YAML workflow definitions
- Template management for reusable workflow components
- State schema validation

## Roadmap

- [ ] Support for parsing both JSON and YAML formats
- [ ] Basic workflow execution engine
- [ ] Runner runtimes:
  - [ ] Simple child processes
  - [ ] Docker daemon: Rely on the system's docker daemon to run the steps in a container
  - [ ] Podman: Use Podman for container execution
- [ ] Matrix execution support
- [ ] Manual triggers and resumable workflows
- [ ] Backend-agnostic state management
- [ ] Diff-based state synchronization
- [ ] API integration for state updates
- [ ] State persistence
- [ ] State-based workflow resumability
- [ ] Template management
- [ ] State schema validation
- [ ] CLI interface with resume capability
- [ ] Web UI for monitoring and manual intervention
- [ ] Distributed execution

## Advanced Features

### Multi-Step Nodes

Nodes can contain multiple steps that are executed sequentially. This allows for organizing complex tasks into logical units:

```yaml
nodes:
  - id: process-data
    name: Process Data
    type: automatic
    steps:
      - name: Validate Data
        run: echo "Validating data"
      
      - name: Transform Data
        run: echo "Transforming data"
          
      - name: Save Results
        run: echo "Saving results"
```

Each step is executed in order, and if any step fails, the entire node is marked as failed.

### Script-Based Commands

Commands can include multi-line scripts with shebang lines to specify the interpreter:

```yaml
steps:
  - name: Run Script
    run: |
      #!/bin/bash
      echo "Running bash script"
      echo "Current directory: $(pwd)"
      echo "Files in directory:"
      ls -la
```

For Python scripts:

```yaml
steps:
  - name: Run Python Script
    run: |
      #!/usr/bin/env python
      import os
      import sys

      print("Running Python script")
      print(f"Python version: {sys.version}")
      print(f"Environment variables:")
      print(f"  REPO_URL: {os.environ.get('REPO_URL')}")
```

The engine automatically detects the script type based on the shebang line and executes it with the appropriate interpreter.

### Step-Level Environment Variables

In addition to node-level environment variables, you can define environment variables at the step level:

```yaml
nodes:
  - id: generate-report
    name: Generate Report
    type: automatic
    steps:
      - name: Collect Results
        run: echo "Collecting results"
        env:
          SCRIPT_LANGUAGE: "bash"
      
      - name: Create Report
        run: echo "Creating report"
        env:
          SCRIPT_LANGUAGE: "python"
    env:
      REPORT_FORMAT: "html"
```

Step-level environment variables override node-level variables with the same name.

### Template Usage with Inputs

Templates can be used with specific inputs to customize their behavior:

```yaml
nodes:
  - id: checkout-code
    name: Checkout Code
    type: automatic
    steps:
      - name: Checkout Repository
        use:
          template: checkout-repo
          inputs:
            repo_url: ${{params.repo_url}}
            branch: "feature/new-feature"
            depth: 1
```

This allows for reusing common functionality with different parameters across multiple nodes.

### Matrix Strategy with Values

Matrix strategies can use explicit values instead of state:

```yaml
nodes:
  - id: process-regions
    name: Process Regions
    type: automatic
    strategy:
      type: matrix
      values:
        - region: us-east
        - region: us-west
        - region: eu-central
    steps:
      - name: Process Region
        run: echo "Processing region $region"
```

This creates a separate task for each value in the matrix.

### Matrix Strategy with State

Matrix strategies can also use values from the workflow state:

```yaml
nodes:
  - id: process-files
    name: Process Files
    type: automatic
    strategy:
      type: matrix
      from_state: files
    steps:
      - name: Process File
        run: echo "Processing file $file"
```

This creates a task for each item in the `files` state array.

### Automatic vs Manual Nodes

Butterflow supports both automatic and manual nodes:

```yaml
nodes:
  - id: automatic-node
    name: Automatic Node
    type: automatic
    steps:
      - run: echo "Running automatically"
          
  - id: manual-node
    name: Manual Node
    type: manual
    depends_on:
      - automatic-node
    steps:
      - run: echo "Running after manual approval"
```

Automatic nodes run as soon as their dependencies are satisfied, while manual nodes require explicit triggering even if all dependencies are met.

### Manual Triggers for Automatic Nodes

Automatic nodes can be configured to require manual triggering:

```yaml
nodes:
  - id: approval-gate
    name: Approval Gate
    type: automatic
    trigger:
      type: manual
    steps:
      - run: echo "Running after manual approval"
```

This is useful for creating approval gates in otherwise automatic workflows.

## Complete Workflow Examples

### Simple Workflow

A basic workflow with sequential nodes:

```yaml
version: "1"
nodes:
  - id: hello-world
    name: Hello World
    type: automatic
    steps:
      - run: echo "Hello, World!"

  - id: current-time
    name: Current Time
    type: automatic
    depends_on:
      - hello-world
    steps:
      - run: date
```

### Matrix Workflow

A workflow with matrix-based parallel execution:

```yaml
version: "1"
nodes:
  - id: setup
    name: Setup
    type: automatic
    steps:
      - run: echo "Setting up environment"

  - id: process-regions
    name: Process Regions
    type: automatic
    depends_on:
      - setup
    strategy:
      type: matrix
      values:
        - region: us-east
        - region: us-west
        - region: eu-central
    steps:
      - run: echo "Processing region $region"

  - id: finalize
    name: Finalize
    type: automatic
    depends_on:
      - process-regions
    steps:
      - run: echo "Finalizing processing"
```

### Complex Workflow with Templates and Manual Approval

A more complex workflow with templates, matrix execution, and manual approval:

```yaml
version: "1"
state:
  schema:
    - name: i18nShardsTs
      type: array
      items:
        type: object
        properties:
          team:
            type: string
          shardId:
            type: string

templates:
  - id: checkout-repo
    name: Checkout Repository
    inputs:
      - name: repo_url
        type: string
        required: true
      - name: branch
        type: string
        default: "main"
    steps:
      - run: git clone ${{inputs.repo_url}} repo
      - run: cd repo && git checkout ${{inputs.branch}}

nodes:
  - id: evaluate-codeowners
    name: Evaluate codeowners
    type: automatic
    steps:
      - use:
          template: checkout-repo
          inputs:
            repo_url: ${{params.repo_url}}
            branch: ${{params.branch}}
      - run: echo "Evaluating codeowners"

  - id: run-codemod-ts
    name: I18n Codemod (TS)
    type: automatic
    trigger:
      type: manual
    depends_on:
      - evaluate-codeowners
    strategy:
      type: matrix
      from_state: i18nShardsTs
    steps:
      - run: echo "Running TS codemod for team ${{team}}"
```

These examples demonstrate the flexibility and power of Butterflow for defining complex workflow processes.

## Workflow Validation

Butterflow performs comprehensive validation of workflow definitions before execution to ensure they are well-formed and can be executed correctly. This validation happens automatically when a workflow is loaded, but can also be performed explicitly using the `validate` command.

### Validation Checks

The following validation checks are performed:

1. **Schema Validation**: Ensures the workflow definition adheres to the expected schema
2. **Node ID Uniqueness**: Verifies that all node IDs are unique
3. **Step ID Uniqueness**: Checks that step IDs within a node are unique
4. **Template ID Uniqueness**: Ensures all template IDs are unique
5. **Dependency Validation**: Verifies that all referenced dependencies exist
6. **Cyclic Dependency Detection**: Prevents circular dependencies between nodes
7. **Template Reference Validation**: Ensures all template references are valid
8. **Matrix Strategy Validation**: Verifies that matrix strategies have valid configurations
9. **State Schema Validation**: Ensures state schema definitions are valid
10. **Variable Reference Validation**: Checks that variable references follow the correct syntax

### Cyclic Dependency Prevention

One of the most important validation checks is the detection of cyclic dependencies. A cyclic dependency occurs when a node depends on itself, either directly or indirectly through other nodes. For example:

```yaml
nodes:
  - id: node-a
    depends_on:
      - node-b
  
  - id: node-b
    depends_on:
      - node-c
  
  - id: node-c
    depends_on:
      - node-a  # Creates a cycle: node-a → node-b → node-c → node-a
```

Butterflow detects such cycles using a topological sorting algorithm and reports them as validation errors:

```bash
$ butterflow validate -w cyclic-workflow.yaml
✗ Workflow definition is invalid
Error: Cyclic dependency detected: node-a → node-b → node-c → node-a
```

### Dependency Graph Visualization

Butterflow can generate a visual representation of the workflow's dependency graph to help identify potential issues:

```bash
$ butterflow graph -w workflow.yaml -o workflow-graph.png
Generating dependency graph...
Graph saved to workflow-graph.png
```

This visualization can be helpful for understanding complex workflows and verifying that dependencies are correctly defined.

### Validation Examples

#### Valid Workflow

```bash
$ butterflow validate -w valid-workflow.yaml
✓ Workflow definition is valid
Schema validation: Passed
Node dependencies: Valid (3 nodes, 2 dependency relationships)
Template references: Valid (2 templates, 3 references)
Matrix strategies: Valid (1 matrix node)
State schema: Valid (2 schema definitions)
```

#### Invalid Workflow with Multiple Issues

```bash
$ butterflow validate -w invalid-workflow.yaml
✗ Workflow definition is invalid
Error at nodes[2].strategy: Matrix strategy requires 'values' or 'from_state' property
Error at nodes[1].depends_on[0]: Referenced node 'non-existent-node' does not exist
Error: Cyclic dependency detected: node-a → node-b → node-a
Error at nodes[0].steps[1].uses[0]: Referenced template 'non-existent-template' does not exist
```

### Automatic Validation

Validation is performed automatically when running a workflow:

```bash
$ butterflow run -w invalid-workflow.yaml
✗ Workflow definition is invalid
Error: Cyclic dependency detected: node-a → node-b → node-a
Workflow execution aborted
```

This ensures that only valid workflows are executed, preventing potential runtime issues.

### Schema Validation

A workflow JSON schema is provided in the `schemas` directory for, e.g., LSP
checks.
