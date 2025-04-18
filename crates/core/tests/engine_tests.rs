use std::collections::HashMap;

use butterflow_core::engine::Engine;
use butterflow_core::{
    Node, Result, Runtime, RuntimeType, Step, Task, TaskStatus, Template, Workflow, WorkflowRun,
    WorkflowStatus,
};
use butterflow_models::node::NodeType;
use butterflow_models::step::StepAction;
use butterflow_models::strategy::Strategy;
use butterflow_state::{LocalStateAdapter, StateAdapter};
use uuid::Uuid;

// Mock state adapter for testing
struct MockStateAdapter {
    workflow_runs: HashMap<Uuid, WorkflowRun>,
    tasks: HashMap<Uuid, Task>,
    state: HashMap<String, serde_json::Value>,
}

impl MockStateAdapter {
    fn new() -> Self {
        Self {
            workflow_runs: HashMap::new(),
            tasks: HashMap::new(),
            state: HashMap::new(),
        }
    }
}

#[async_trait::async_trait]
impl StateAdapter for MockStateAdapter {
    async fn save_workflow_run(&mut self, workflow_run: &WorkflowRun) -> Result<()> {
        self.workflow_runs
            .insert(workflow_run.id, workflow_run.clone());
        Ok(())
    }

    async fn apply_workflow_run_diff(
        &mut self,
        diff: &butterflow_models::WorkflowRunDiff,
    ) -> Result<()> {
        let mut workflow_run = self.get_workflow_run(diff.workflow_run_id).await?;

        for (field, field_diff) in &diff.fields {
            match field_diff.operation {
                butterflow_models::DiffOperation::Add
                | butterflow_models::DiffOperation::Update => {
                    if let Some(value) = &field_diff.value {
                        let mut workflow_run_value = serde_json::to_value(&workflow_run)?;
                        if let serde_json::Value::Object(obj) = &mut workflow_run_value {
                            obj.insert(field.clone(), value.clone());
                        }
                        workflow_run = serde_json::from_value(workflow_run_value)?;
                    }
                }
                butterflow_models::DiffOperation::Remove => {
                    let mut workflow_run_value = serde_json::to_value(&workflow_run)?;
                    if let serde_json::Value::Object(obj) = &mut workflow_run_value {
                        obj.remove(field);
                    }
                    workflow_run = serde_json::from_value(workflow_run_value)?;
                }
            }
        }

        self.save_workflow_run(&workflow_run).await
    }

    async fn get_workflow_run(&self, workflow_run_id: Uuid) -> Result<WorkflowRun> {
        self.workflow_runs
            .get(&workflow_run_id)
            .cloned()
            .ok_or_else(|| {
                butterflow_models::Error::Other(format!(
                    "Workflow run {} not found",
                    workflow_run_id
                ))
            })
    }

    async fn list_workflow_runs(&self, limit: usize) -> Result<Vec<WorkflowRun>> {
        let mut runs: Vec<WorkflowRun> = self.workflow_runs.values().cloned().collect();
        runs.sort_by(|a, b| b.started_at.cmp(&a.started_at));
        Ok(runs.into_iter().take(limit).collect())
    }

    async fn save_task(&mut self, task: &Task) -> Result<()> {
        self.tasks.insert(task.id, task.clone());
        Ok(())
    }

    async fn apply_task_diff(&mut self, diff: &butterflow_models::TaskDiff) -> Result<()> {
        let mut task = self.get_task(diff.task_id).await?;

        for (field, field_diff) in &diff.fields {
            match field_diff.operation {
                butterflow_models::DiffOperation::Add
                | butterflow_models::DiffOperation::Update => {
                    if let Some(value) = &field_diff.value {
                        let mut task_value = serde_json::to_value(&task)?;
                        if let serde_json::Value::Object(obj) = &mut task_value {
                            obj.insert(field.clone(), value.clone());
                        }
                        task = serde_json::from_value(task_value)?;
                    }
                }
                butterflow_models::DiffOperation::Remove => {
                    let mut task_value = serde_json::to_value(&task)?;
                    if let serde_json::Value::Object(obj) = &mut task_value {
                        obj.remove(field);
                    }
                    task = serde_json::from_value(task_value)?;
                }
            }
        }

        self.save_task(&task).await
    }

    async fn get_task(&self, task_id: Uuid) -> Result<Task> {
        self.tasks
            .get(&task_id)
            .cloned()
            .ok_or_else(|| butterflow_models::Error::Other(format!("Task {} not found", task_id)))
    }

    async fn get_tasks(&self, workflow_run_id: Uuid) -> Result<Vec<Task>> {
        Ok(self
            .tasks
            .values()
            .filter(|t| t.workflow_run_id == workflow_run_id)
            .cloned()
            .collect())
    }

    async fn update_state(
        &mut self,
        _workflow_run_id: Uuid,
        state: HashMap<String, serde_json::Value>,
    ) -> Result<()> {
        self.state = state;
        Ok(())
    }

    async fn apply_state_diff(&mut self, diff: &butterflow_models::StateDiff) -> Result<()> {
        let mut state = self.get_state(diff.workflow_run_id).await?;

        for (field, field_diff) in &diff.fields {
            match field_diff.operation {
                butterflow_models::DiffOperation::Add
                | butterflow_models::DiffOperation::Update => {
                    if let Some(value) = &field_diff.value {
                        state.insert(field.clone(), value.clone());
                    }
                }
                butterflow_models::DiffOperation::Remove => {
                    state.remove(field);
                }
            }
        }

        self.update_state(diff.workflow_run_id, state).await
    }

    async fn get_state(
        &self,
        _workflow_run_id: Uuid,
    ) -> Result<HashMap<String, serde_json::Value>> {
        Ok(self.state.clone())
    }
}

// Helper function to create a simple test workflow
fn create_test_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec![],
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Hello, World!'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["node1".to_string()],
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Node 2 executed'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    }
}

// Helper function to create a workflow with a manual trigger
fn create_manual_trigger_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec![],
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Hello, World!'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Manual,
                depends_on: vec!["node1".to_string()],
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Node 2 executed'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    }
}

// Helper function to create a workflow with a manual node type
fn create_manual_node_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec![],
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Hello, World!'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Manual,
                depends_on: vec!["node1".to_string()],
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Node 2 executed'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    }
}

// Helper function to create a workflow with a matrix strategy
fn create_matrix_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec![],
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Hello, World!'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["node1".to_string()],
                strategy: Some(Strategy {
                    r#type: butterflow_models::strategy::StrategyType::Matrix,
                    values: Some(vec![
                        HashMap::from([("region".to_string(), "us-east".to_string())]),
                        HashMap::from([("region".to_string(), "us-west".to_string())]),
                        HashMap::from([("region".to_string(), "eu-central".to_string())]),
                    ]),
                    from_state: None,
                }),
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Processing region ${region}'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    }
}

// Helper function to create a workflow with templates
fn create_template_workflow() -> Workflow {
    let template = Template {
        id: "checkout-repo".to_string(),
        name: "Checkout Repository".to_string(),
        description: Some("Standard process for checking out a repository".to_string()),
        inputs: vec![
            butterflow_models::TemplateInput {
                name: "repo_url".to_string(),
                r#type: "string".to_string(),
                required: true,
                description: Some("URL of the repository to checkout".to_string()),
                default: None,
            },
            butterflow_models::TemplateInput {
                name: "branch".to_string(),
                r#type: "string".to_string(),
                required: false,
                description: Some("Branch to checkout".to_string()),
                default: Some("main".to_string()),
            },
        ],
        runtime: Some(Runtime {
            r#type: RuntimeType::Direct,
            image: None,
            working_dir: None,
            user: None,
            network: None,
            options: None,
        }),
        steps: vec![Step {
            id: "clone".to_string(),
            name: "Clone repository".to_string(),
            description: None,
            action: StepAction::RunScript(
                "echo 'Cloning repository ${inputs.repo_url} branch ${inputs.branch}'".to_string(),
            ),
            env: None,
        }],
        outputs: vec![],
        env: HashMap::new(),
    };

    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![template],
        nodes: vec![Node {
            id: "node1".to_string(),
            name: "Node 1".to_string(),
            description: Some("Test node 1".to_string()),
            r#type: NodeType::Automatic,
            depends_on: vec![],
            strategy: None,
            runtime: Some(Runtime {
                r#type: RuntimeType::Direct,
                image: None,
                working_dir: None,
                user: None,
                network: None,
                options: None,
            }),
            steps: vec![Step {
                id: "step1".to_string(),
                name: "Step 1".to_string(),
                description: None,
                action: StepAction::UseTemplates(vec![butterflow_models::step::TemplateUse {
                    template: "checkout-repo".to_string(),
                    inputs: HashMap::from([
                        (
                            "repo_url".to_string(),
                            "https://github.com/example/repo".to_string(),
                        ),
                        ("branch".to_string(), "feature/test".to_string()),
                    ]),
                }]),
                env: None,
            }],
            env: HashMap::new(),
        }],
    }
}

// Helper function to create a workflow with matrix strategy from state
fn create_matrix_from_state_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: Some(butterflow_models::WorkflowState {
            schema: vec![butterflow_models::StateSchema {
                name: "files".to_string(),
                r#type: butterflow_models::StateSchemaType::Array,
                items: Some(Box::new(butterflow_models::StateSchemaItems {
                    r#type: butterflow_models::StateSchemaType::Object,
                    properties: Some(HashMap::from([(
                        "file".to_string(),
                        butterflow_models::StateSchemaProperty {
                            r#type: butterflow_models::StateSchemaType::String,
                            description: None,
                        },
                    )])),
                })),
                description: None,
            }],
        }),
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec![],
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Setting up state'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["node1".to_string()],
                strategy: Some(Strategy {
                    r#type: butterflow_models::strategy::StrategyType::Matrix,
                    values: None,
                    from_state: Some("files".to_string()),
                }),
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Processing file ${file}'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    }
}

#[tokio::test]
async fn test_engine_new() {
    let _ = Engine::new();
}

#[tokio::test]
async fn test_engine_with_state_adapter() {
    let state_adapter = Box::new(LocalStateAdapter::new());
    let _ = Engine::with_state_adapter(state_adapter);
}

#[tokio::test]
async fn test_run_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_test_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();
    assert_eq!(workflow_run.id, workflow_run_id);

    // The workflow should be running or completed
    assert!(
        workflow_run.status == WorkflowStatus::Running
            || workflow_run.status == WorkflowStatus::Completed
    );
}

#[tokio::test]
async fn test_get_workflow_status() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_test_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    let status = engine.get_workflow_status(workflow_run_id).await.unwrap();

    // The workflow should be running or completed
    assert!(status == WorkflowStatus::Running || status == WorkflowStatus::Completed);
}

#[tokio::test]
async fn test_get_tasks() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_test_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine.run_workflow(workflow.clone(), params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // There should be tasks for each node
    assert_eq!(tasks.len(), workflow.nodes.len());

    // Check that the tasks have the correct node IDs
    let node_ids: Vec<String> = tasks.iter().map(|t| t.node_id.clone()).collect();
    assert!(node_ids.contains(&"node1".to_string()));
    assert!(node_ids.contains(&"node2".to_string()));
}

#[tokio::test]
async fn test_list_workflow_runs() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    // Run multiple workflows
    let workflow = create_test_workflow();
    let params = HashMap::new();

    let workflow_run_id1 = engine
        .run_workflow(workflow.clone(), params.clone())
        .await
        .unwrap();
    let workflow_run_id2 = engine
        .run_workflow(workflow.clone(), params.clone())
        .await
        .unwrap();

    // Allow some time for the workflows to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    let runs = engine.list_workflow_runs(10).await.unwrap();

    // There should be at least 2 workflow runs
    assert!(runs.len() >= 2);

    // The runs should include our workflow run IDs
    let run_ids: Vec<Uuid> = runs.iter().map(|r| r.id).collect();
    assert!(run_ids.contains(&workflow_run_id1));
    assert!(run_ids.contains(&workflow_run_id2));
}

#[tokio::test]
async fn test_cancel_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_test_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Cancel the workflow
    engine.cancel_workflow(workflow_run_id).await.unwrap();

    // Check the workflow status
    let status = engine.get_workflow_status(workflow_run_id).await.unwrap();
    assert_eq!(status, WorkflowStatus::Canceled);
}

#[tokio::test]
async fn test_manual_trigger_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_manual_trigger_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // Find the task for node2 which should be awaiting trigger
    let node2_task = tasks.iter().find(|t| t.node_id == "node2").unwrap();

    // Check that the task is awaiting trigger
    assert_eq!(node2_task.status, TaskStatus::AwaitingTrigger);

    // Trigger the task using resume_workflow
    engine
        .resume_workflow(workflow_run_id, vec![node2_task.id])
        .await
        .unwrap();

    // Allow some time for the task to complete
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the updated tasks
    let updated_tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // Find the updated task for node2
    let updated_node2_task = updated_tasks
        .iter()
        .find(|t| t.id == node2_task.id)
        .unwrap();

    // Check that the task is now running or completed
    assert!(
        updated_node2_task.status == TaskStatus::Running
            || updated_node2_task.status == TaskStatus::Completed
    );
}

#[tokio::test]
async fn test_manual_node_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_manual_node_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // Find the task for node2 which should be awaiting trigger
    let node2_task = tasks.iter().find(|t| t.node_id == "node2").unwrap();

    // Check that the task is awaiting trigger
    assert_eq!(node2_task.status, TaskStatus::AwaitingTrigger);

    // Trigger the task using resume_workflow
    engine
        .resume_workflow(workflow_run_id, vec![node2_task.id])
        .await
        .unwrap();

    // Allow some time for the task to complete
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the updated tasks
    let updated_tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // Find the updated task for node2
    let updated_node2_task = updated_tasks
        .iter()
        .find(|t| t.id == node2_task.id)
        .unwrap();

    // Check that the task is now running or completed
    assert!(
        updated_node2_task.status == TaskStatus::Running
            || updated_node2_task.status == TaskStatus::Completed
    );
}

#[tokio::test]
async fn test_matrix_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_matrix_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // There should be at least 4 tasks:
    // 1 for node1, 1 master task for node2, and 3 matrix tasks for node2
    assert!(tasks.len() >= 4);

    // Count the number of tasks for node2
    let node2_tasks = tasks.iter().filter(|t| t.node_id == "node2").count();

    // There should be at least 3 matrix tasks for node2 (one for each region)
    assert!(node2_tasks >= 3);
}

#[tokio::test]
async fn test_template_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_template_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow run
    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();

    // Check that the workflow run is running or completed
    assert!(
        workflow_run.status == WorkflowStatus::Running
            || workflow_run.status == WorkflowStatus::Completed
    );

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // There should be at least 1 task
    assert!(!tasks.is_empty());

    // Check that the task for node1 exists
    let node1_task = tasks.iter().find(|t| t.node_id == "node1").unwrap();

    // Print the task status for debugging
    println!("Node1 task status: {:?}", node1_task.status);
}

// Test for trigger_all method
#[tokio::test]
async fn test_trigger_all() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_manual_trigger_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow status
    let status = engine.get_workflow_status(workflow_run_id).await.unwrap();

    // The workflow should be awaiting trigger or running
    assert!(status == WorkflowStatus::AwaitingTrigger || status == WorkflowStatus::Running);

    // Trigger all awaiting tasks
    engine.trigger_all(workflow_run_id).await.unwrap();

    // Allow some time for the tasks to complete
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow status again
    let status = engine.get_workflow_status(workflow_run_id).await.unwrap();

    // The workflow should now be running or completed
    assert!(status == WorkflowStatus::Running || status == WorkflowStatus::Completed);
}

// Helper function to create a workflow with environment variables
fn create_env_var_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![Node {
            id: "node1".to_string(),
            name: "Node 1".to_string(),
            description: Some("Test node 1".to_string()),
            r#type: NodeType::Automatic,
            depends_on: vec![],
            strategy: None,
            runtime: Some(Runtime {
                r#type: RuntimeType::Direct,
                image: None,
                working_dir: None,
                user: None,
                network: None,
                options: None,
            }),
            steps: vec![Step {
                id: "step1".to_string(),
                name: "Step 1".to_string(),
                description: None,
                action: StepAction::RunScript("echo 'Using env var: $TEST_ENV_VAR'".to_string()),
                env: Some(HashMap::from([(
                    "STEP_SPECIFIC_VAR".to_string(),
                    "step-value".to_string(),
                )])),
            }],
            env: HashMap::from([
                ("TEST_ENV_VAR".to_string(), "test-value".to_string()),
                ("NODE_SPECIFIC_VAR".to_string(), "node-value".to_string()),
            ]),
        }],
    }
}

// Helper function to create a workflow with variable resolution
fn create_variable_resolution_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![Node {
            id: "node1".to_string(),
            name: "Node 1 for ${params.repo_name}".to_string(),
            description: Some("Processing ${params.branch}".to_string()),
            r#type: NodeType::Automatic,
            depends_on: vec![],
            strategy: None,
            runtime: Some(Runtime {
                r#type: RuntimeType::Direct,
                image: None,
                working_dir: None,
                user: None,
                network: None,
                options: None,
            }),
            steps: vec![Step {
                id: "step1".to_string(),
                name: "Step 1".to_string(),
                description: None,
                action: StepAction::RunScript(
                    "echo 'Processing repo: ${params.repo_name} on branch: ${params.branch}'"
                        .to_string(),
                ),
                env: None,
            }],
            env: HashMap::from([
                ("REPO_URL".to_string(), "${params.repo_url}".to_string()),
                ("DEBUG".to_string(), "${env.CI}".to_string()),
            ]),
        }],
    }
}

#[tokio::test]
async fn test_matrix_from_state_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_matrix_from_state_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow run
    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();

    // Check that the workflow run is running or completed
    assert!(
        workflow_run.status == WorkflowStatus::Running
            || workflow_run.status == WorkflowStatus::Completed
    );
}

#[tokio::test]
async fn test_env_var_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_env_var_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow run
    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();

    // Check that the workflow run is running or completed
    assert!(
        workflow_run.status == WorkflowStatus::Running
            || workflow_run.status == WorkflowStatus::Completed
    );

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // There should be at least 1 task
    assert!(!tasks.is_empty());

    // Check that the task for node1 exists
    let node1_task = tasks.iter().find(|t| t.node_id == "node1").unwrap();

    // Check that the task status is valid
    assert!(
        node1_task.status == TaskStatus::Running
            || node1_task.status == TaskStatus::Completed
            || node1_task.status == TaskStatus::Failed
    );
}

#[tokio::test]
async fn test_variable_resolution_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_variable_resolution_workflow();

    // Create parameters for variable resolution
    let mut params = HashMap::new();
    params.insert("repo_name".to_string(), "example-repo".to_string());
    params.insert("branch".to_string(), "main".to_string());
    params.insert(
        "repo_url".to_string(),
        "https://github.com/example/repo".to_string(),
    );

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow run
    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();

    // Check that the workflow run is running or completed
    assert!(
        workflow_run.status == WorkflowStatus::Running
            || workflow_run.status == WorkflowStatus::Completed
    );

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // There should be at least 1 task
    assert!(!tasks.is_empty());

    // Check that the task for node1 exists
    let node1_task = tasks.iter().find(|t| t.node_id == "node1").unwrap();

    // Check that the task status is valid
    assert!(
        node1_task.status == TaskStatus::Running
            || node1_task.status == TaskStatus::Completed
            || node1_task.status == TaskStatus::Failed
    );

    // Check that the parameters were saved
    assert_eq!(
        workflow_run.params.get("repo_name").unwrap(),
        "example-repo"
    );
    assert_eq!(workflow_run.params.get("branch").unwrap(), "main");
    assert_eq!(
        workflow_run.params.get("repo_url").unwrap(),
        "https://github.com/example/repo"
    );
}

#[tokio::test]
async fn test_invalid_workflow_run_id() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    // Generate a random UUID that doesn't exist
    let invalid_id = Uuid::new_v4();

    // Try to get a workflow run with an invalid ID
    let result = engine.get_workflow_run(invalid_id).await;

    // The result should be an error
    assert!(result.is_err());
}

#[tokio::test]
async fn test_workflow_with_params() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_test_workflow();

    // Create parameters
    let mut params = HashMap::new();
    params.insert("test_param".to_string(), "test_value".to_string());

    let workflow_run_id = engine.run_workflow(workflow, params).await.unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow run
    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();

    // Check that the parameters were saved
    assert_eq!(workflow_run.params.get("test_param").unwrap(), "test_value");
}

#[tokio::test]
async fn test_cyclic_dependency_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    // Create a workflow with a cyclic dependency
    let workflow = Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["node2".to_string()], // Depends on node2
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Hello, World!'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["node1".to_string()], // Depends on node1, creating a cycle
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    id: "step1".to_string(),
                    name: "Step 1".to_string(),
                    description: None,
                    action: StepAction::RunScript("echo 'Node 2 executed'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    };

    let params = HashMap::new();

    // Running this workflow should fail due to the cyclic dependency
    let result = engine.run_workflow(workflow, params).await;

    // The result should be an error
    assert!(result.is_err());
}

#[tokio::test]
async fn test_invalid_template_reference() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    // Create a workflow with an invalid template reference
    let workflow = Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![Node {
            id: "node1".to_string(),
            name: "Node 1".to_string(),
            description: Some("Test node 1".to_string()),
            r#type: NodeType::Automatic,
            depends_on: vec![],
            strategy: None,
            runtime: Some(Runtime {
                r#type: RuntimeType::Direct,
                image: None,
                working_dir: None,
                user: None,
                network: None,
                options: None,
            }),
            steps: vec![Step {
                id: "step1".to_string(),
                name: "Step 1".to_string(),
                description: None,
                action: StepAction::UseTemplates(vec![butterflow_models::step::TemplateUse {
                    template: "non-existent-template".to_string(), // This template doesn't exist
                    inputs: HashMap::new(),
                }]),
                env: None,
            }],
            env: HashMap::new(),
        }],
    };

    let params = HashMap::new();

    // Running this workflow should fail due to the invalid template reference
    let result = engine.run_workflow(workflow, params).await;

    // The result should be an error
    assert!(result.is_err());
}
