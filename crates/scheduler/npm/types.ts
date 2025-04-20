export type JsonValue = number | string | boolean | Array<JsonValue> | { [key in string]?: JsonValue } | null;
export type Strategy = { 
/**
 * Type of strategy
 */
type: StrategyType, 
/**
 * Matrix values (for matrix strategy)
 */
values?: Record<string, string>[] | null, 
/**
 * State key to get matrix values from (for matrix strategy)
 */
from_state?: string | null, };
export type TemplateUse = { 
/**
 * Template ID to use
 */
template: string, 
/**
 * Inputs to pass to the template
 */
inputs: Record<string, string>, };
export type Node = { 
/**
 * Unique identifier for the node
 */
id: string, 
/**
 * Human-readable name
 */
name: string, 
/**
 * Detailed description of what the node does
 */
description?: string | null, 
/**
 * Type of node (automatic or manual)
 */
type: NodeType, 
/**
 * IDs of nodes that must complete before this node can run
 */
depends_on: string[], 
/**
 * Configuration for how the node is triggered
 */
trigger?: Trigger | null, 
/**
 * Configuration for running multiple instances of this node
 */
strategy?: Strategy | null, 
/**
 * Container runtime configuration
 */
runtime?: Runtime | null, 
/**
 * Steps to execute within the node
 */
steps: Array<Step>, 
/**
 * Environment variables to inject into the container
 */
env: Record<string, string>, };
export type TemplateInput = { 
/**
 * Name of the input
 */
name: string, 
/**
 * Type of the input (string, number, boolean)
 */
type: string, 
/**
 * Whether the input is required
 */
required: boolean, 
/**
 * Description of the input
 */
description: string | null, 
/**
 * Default value for the input
 */
default: string | null, };
export type TemplateOutput = { 
/**
 * Name of the output
 */
name: string, 
/**
 * Value of the output
 */
value: string, 
/**
 * Description of the output
 */
description: string | null, };
export type Trigger = { 
/**
 * Type of trigger
 */
type: TriggerType, };
export type WorkflowRunDiff = { 
/**
 * The ID of the workflow run
 */
workflow_run_id: string, 
/**
 * The fields to update
 */
fields: { [key in string]?: FieldDiff }, };
export type Workflow = { 
/**
 * Version of the workflow format
 */
version: string, 
/**
 * State schema definition
 */
state?: WorkflowState | null, 
/**
 * Templates for reusable components
 */
templates: Array<Template>, 
/**
 * Nodes in the workflow
 */
nodes: Array<Node>, };
export type StateSchema = { 
/**
 * Name of the state schema
 */
name: string, 
/**
 * Type of the state schema
 */
type: StateSchemaType, 
/**
 * For array types, the schema of the items
 */
items?: StateSchemaItems | null, 
/**
 * Description of the state schema
 */
description?: string | null, };
export type StateSchemaItems = { 
/**
 * Type of the items
 */
type: StateSchemaType, 
/**
 * For object types, the properties of the object
 */
properties?: { [key in string]?: StateSchemaProperty } | null, };
export type TaskStatus = "Pending" | "Running" | "Completed" | "Failed" | "AwaitingTrigger" | "Blocked" | "WontDo";
export type TaskDiff = { 
/**
 * The ID of the task
 */
task_id: string, 
/**
 * The fields to update
 */
fields: { [key in string]?: FieldDiff }, };
export type Runtime = { 
/**
 * Type of runtime
 */
type: RuntimeType, 
/**
 * Container image (for Docker and Podman)
 */
image?: string | null, 
/**
 * Working directory inside the container
 */
working_dir?: string | null, 
/**
 * User to run as inside the container
 */
user?: string | null, 
/**
 * Network mode for the container
 */
network?: string | null, 
/**
 * Additional container options
 */
options?: Array<string> | null, };
export type DiffOperation = "Add" | "Update" | "Remove" | "Append";
export type FieldDiff = { 
/**
 * The operation to perform
 */
operation: DiffOperation, 
/**
 * The new value (for Add and Update operations)
 */
value: JsonValue | null, };
export type StateDiff = { 
/**
 * The ID of the workflow run
 */
workflow_run_id: string, 
/**
 * The fields to update
 */
fields: { [key in string]?: FieldDiff }, };
export type StateSchemaProperty = { 
/**
 * Type of the property
 */
type: StateSchemaType, 
/**
 * Description of the property
 */
description?: string | null, };
export type StrategyType = "matrix";
export type Task = { 
/**
 * Unique identifier for the task
 */
id: string, 
/**
 * ID of the workflow run this task belongs to
 */
workflow_run_id: string, 
/**
 * ID of the node this task is an instance of
 */
node_id: string, 
/**
 * Current status of the task
 */
status: TaskStatus, 
/**
 * Whether or not this task is a master task for other matrix tasks.
 */
is_master: boolean, 
/**
 * For matrix tasks, the master task ID
 */
master_task_id?: string | null, 
/**
 * For matrix tasks, the matrix values
 */
matrix_values?: { [key in string]?: string } | null, 
/**
 * Start time of the task
 */
started_at?: string | null, 
/**
 * End time of the task (if completed or failed)
 */
ended_at?: string | null, 
/**
 * Error message (if failed)
 */
error?: string | null, 
/**
 * Logs from the task
 */
logs: Array<string>, };
export type WorkflowStatus = "Pending" | "Running" | "Completed" | "Failed" | "AwaitingTrigger" | "Canceled";
export type NodeType = "automatic" | "manual";
export type Template = { 
/**
 * Unique identifier for the template
 */
id: string, 
/**
 * Human-readable name
 */
name: string, 
/**
 * Detailed description of what the template does
 */
description?: string | null, 
/**
 * Container runtime configuration
 */
runtime?: Runtime | null, 
/**
 * Inputs for the template
 */
inputs: Array<TemplateInput>, 
/**
 * Steps to execute within the template
 */
steps: Array<Step>, 
/**
 * Outputs from the template
 */
outputs: Array<TemplateOutput>, 
/**
 * Environment variables to inject into the container
 */
env: Record<string, string>, };
export type RuntimeType = "direct" | "docker" | "podman";
export type WorkflowState = { 
/**
 * Schema definitions
 */
schema: Array<StateSchema>, };
export type TriggerType = "automatic" | "manual";
export type Step = { 
/**
 * Human-readable name
 */
name: string, 
/**
 * Environment variables specific to this step
 */
env?: Record<string, string> | null, } & ({ "use": TemplateUse } | { "run": string });
export type StateSchemaType = "array" | "object" | "string" | "number" | "boolean";
export type WorkflowRun = { 
/**
 * Unique identifier for the workflow run
 */
id: string, 
/**
 * The workflow definition
 */
workflow: Workflow, 
/**
 * Current status of the workflow run
 */
status: WorkflowStatus, 
/**
 * Parameters passed to the workflow
 */
params: { [key in string]?: string }, 
/**
 * Tasks created for this workflow run
 */
tasks: Array<string>, 
/**
 * Start time of the workflow run
 */
started_at: string, 
/**
 * End time of the workflow run (if completed or failed)
 */
ended_at?: string | null, };
