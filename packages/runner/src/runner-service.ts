import { EventEmitter } from "node:events";

export abstract class CodemodCloudRunnerAbstract extends EventEmitter {
  abstract waitForCompletion(): Promise<void>;
}

export interface RunnerServiceInterface {
  startCodemodRun(params: {
    source: string;
    engine: "workflow";
  }): Promise<CodemodCloudRunnerAbstract>;
}
