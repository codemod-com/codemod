import { mockedGhRunEndpoints } from "./mocks/gh-run";
import { mockedWorkflowRunEndpoints } from "./mocks/workflow-runs";

export const mockedEndpoints = {
  ...mockedGhRunEndpoints,
  ...mockedWorkflowRunEndpoints,
};
