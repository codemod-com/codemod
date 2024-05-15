export const isWorkflowFile = async (path: string) =>
  path.endsWith(".workflow.ts");
