type StrategyType = "matrix";
type Step = { 
/**
 * Human-readable name
 */
name: string, 
/**
 * Environment variables specific to this step
 */
env: Record<string, string> | null, } & ({ "use": TemplateUse } | { "run": string });
type NodeType = "automatic" | "manual";
type StateSchemaItems = { 
/**
 * Type of the items
 */
type: StateSchemaType, 
/**
 * For object types, the properties of the object
 */
properties: { [key in string]?: StateSchemaProperty } | null, };
type StateSchemaProperty = { 
/**
 * Type of the property
 */
type: StateSchemaType, 
/**
 * Description of the property
 */
description: string | null, };
type TemplateInput = { 
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
type StateSchemaType = "array" | "object" | "string" | "number" | "boolean";
type Runtime = { 
/**
 * Type of runtime
 */
type: RuntimeType, 
/**
 * Container image (for Docker and Podman)
 */
image: string | null, 
/**
 * Working directory inside the container
 */
working_dir: string | null, 
/**
 * User to run as inside the container
 */
user: string | null, 
/**
 * Network mode for the container
 */
network: string | null, 
/**
 * Additional container options
 */
options: Array<string> | null, };
type Template = { 
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
description: string | null, 
/**
 * Container runtime configuration
 */
runtime: Runtime | null, 
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
type Node = { 
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
description: string | null, 
/**
 * Type of node (automatic or manual)
 */
type: NodeType, 
/**
 * IDs of nodes that must complete before this node can run
 */
depends_on: Array<string>, 
/**
 * Configuration for how the node is triggered
 */
trigger: Trigger | null, 
/**
 * Configuration for running multiple instances of this node
 */
strategy: Strategy | null, 
/**
 * Container runtime configuration
 */
runtime: Runtime | null, 
/**
 * Steps to execute within the node
 */
steps: Array<Step>, 
/**
 * Environment variables to inject into the container
 */
env: Record<string, string>, };
type Strategy = { 
/**
 * Type of strategy
 */
type: StrategyType, 
/**
 * Matrix values (for matrix strategy)
 */
values: Record<string, string>[] | null, 
/**
 * State key to get matrix values from (for matrix strategy)
 */
from_state: string | null, };
type RuntimeType = "direct" | "docker" | "podman";
type TemplateUse = { 
/**
 * Template ID to use
 */
template: string, 
/**
 * Inputs to pass to the template
 */
inputs: Record<string, string>, };
type TemplateOutput = { 
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
type TriggerType = "automatic" | "manual";
type Workflow = { 
/**
 * Version of the workflow format
 */
version: string, 
/**
 * State schema definition
 */
state: WorkflowState | null, 
/**
 * Templates for reusable components
 */
templates: Array<Template>, 
/**
 * Nodes in the workflow
 */
nodes: Array<Node>, };
type Trigger = { 
/**
 * Type of trigger
 */
type: TriggerType, };
type StateSchema = { 
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
items: StateSchemaItems | null, 
/**
 * Description of the state schema
 */
description: string | null, };
type WorkflowState = { 
/**
 * Schema definitions
 */
schema: Array<StateSchema>, };
