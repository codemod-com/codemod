import {
  type Message,
  type MessageBus,
  MessageKind,
} from "../components/messageBus";
import type { Store } from "../data";
import { actions } from "../data/slice";
import type { JobHash } from "../jobs/types";
import { LeftRightHashSetManager } from "../leftRightHashes/leftRightHashSetManager";
import { isNeitherNullNorUndefined } from "../utilities";
import type { CaseHash } from "./types";

export class CaseManager {
  public constructor(
    private readonly __messageBus: MessageBus,
    private readonly __store: Store,
  ) {
    this.__messageBus.subscribe(MessageKind.upsertCase, (message) =>
      this.#onUpsertCasesMessage(message),
    );
    this.__messageBus.subscribe(MessageKind.acceptCase, (message) =>
      this.#onAcceptCaseMessage(message),
    );
    this.__messageBus.subscribe(MessageKind.rejectCase, (message) =>
      this.#onRejectCaseMessage(message),
    );
    this.__messageBus.subscribe(MessageKind.jobsAccepted, (message) =>
      this.#onJobsAcceptedOrJobsRejectedMessage(message),
    );
    this.__messageBus.subscribe(MessageKind.jobsRejected, (message) =>
      this.#onJobsAcceptedOrJobsRejectedMessage(message),
    );
  }

  #onUpsertCasesMessage(message: Message & { kind: MessageKind.upsertCase }) {
    if (message.jobs.length === 0) {
      return;
    }
    const caseHashJobHashes = message.jobs.map(
      ({ hash }) => `${message.kase.hash}${hash}`,
    );

    this.__store.dispatch(
      actions.upsertCase([message.kase, caseHashJobHashes]),
    );

    this.__messageBus.publish({
      kind: MessageKind.upsertJobs,
      jobs: message.jobs,
    });
  }

  #onAcceptCaseMessage(message: Message & { kind: MessageKind.acceptCase }) {
    const state = this.__store.getState();

    if (!state.case.ids.includes(message.caseHash)) {
      throw new Error("You tried to accept a case that does not exist.");
    }

    const caseHashJobHashSetManager = new LeftRightHashSetManager<
      CaseHash,
      JobHash
    >(new Set(state.caseHashJobHashes));

    // we are not removing cases and jobs here
    // we wait for the jobs accepted message for data removal
    const jobHashes = caseHashJobHashSetManager.getRightHashesByLeftHash(
      message.caseHash,
    );

    this.__messageBus.publish({
      kind: MessageKind.acceptJobs,
      jobHashes,
    });
  }

  #onJobsAcceptedOrJobsRejectedMessage(
    message: Message & {
      kind: MessageKind.jobsAccepted | MessageKind.jobsRejected;
    },
  ) {
    const state = this.__store.getState();

    const cases = Object.values(state.case.entities).filter(
      isNeitherNullNorUndefined,
    );

    const caseHashJobHashSetManager = new LeftRightHashSetManager<
      CaseHash,
      JobHash
    >(new Set(state.caseHashJobHashes));

    const removableCaseHashes: CaseHash[] = [];

    for (const kase of cases) {
      const caseJobHashes = caseHashJobHashSetManager.getRightHashesByLeftHash(
        kase.hash,
      );

      let deletedCount = 0;

      for (const job of message.deletedJobs) {
        const deleted = caseHashJobHashSetManager.delete(kase.hash, job.hash);

        deletedCount += Number(deleted);
      }

      if (caseJobHashes.size <= deletedCount) {
        removableCaseHashes.push(kase.hash);
      }
    }

    this.__store.dispatch(actions.removeCases(removableCaseHashes));
  }

  #onRejectCaseMessage(message: Message & { kind: MessageKind.rejectCase }) {
    const state = this.__store.getState();

    const caseHashJobHashSetManager = new LeftRightHashSetManager<
      CaseHash,
      JobHash
    >(new Set(state.caseHashJobHashes));

    const jobHashes = caseHashJobHashSetManager.getRightHashesByLeftHash(
      message.caseHash,
    );

    this.__store.dispatch(actions.removeCases([message.caseHash]));

    this.__messageBus.publish({
      kind: MessageKind.rejectJobs,
      jobHashes,
    });
  }
}
