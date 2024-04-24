import * as t from "io-ts";
import { withFallback } from "io-ts-types";
import { caseCodec, caseHashCodec } from "../cases/types";
import { codemodEntryCodec } from "../codemods/types";
import { executionErrorCodec } from "../errors/types";
import { persistedJobCodec } from "../jobs/types";
import { codemodNodeHashDigestCodec } from "../selectors/selectCodemodTree";
import { buildTypeCodec } from "../utilities";
import { _explorerNodeHashDigestCodec } from "./explorerNodeCodec";

export const syntheticErrorCodec = buildTypeCodec({
  kind: t.literal("syntheticError"),
  message: t.string,
});

export const workspaceStateCodec = t.union([
  buildTypeCodec({
    _tag: t.literal("Left"),
    left: syntheticErrorCodec,
  }),
  buildTypeCodec({
    _tag: t.literal("Right"),
    right: t.string,
  }),
  buildTypeCodec({
    _tag: t.literal("Both"),
    left: syntheticErrorCodec,
    right: t.string,
  }),
]);

const buildCollectionCodec = <T extends t.Mixed>(entityCodec: T) => {
  return withFallback(
    buildTypeCodec({
      ids: t.readonlyArray(t.union([t.string, t.number])),
      entities: t.record(t.string, t.union([entityCodec, t.undefined])),
    }),
    { ids: [], entities: {} },
  );
};

const activeTabIdCodec = t.union([
  t.literal("codemods"),
  t.literal("codemodRuns"),
  t.literal("community"),
  t.literal("sourceControl"),
]);

export type ActiveTabId = t.TypeOf<typeof activeTabIdCodec>;

export const panelGroupSettingsCodec = t.record(t.string, t.array(t.number));

export type PanelGroupSettings = t.TypeOf<typeof panelGroupSettingsCodec>;

export const persistedStateCodecNew = buildTypeCodec({
  clearingInProgress: withFallback(t.boolean, false),
  case: buildCollectionCodec(caseCodec),
  codemod: buildCollectionCodec(codemodEntryCodec),
  job: buildCollectionCodec(persistedJobCodec),
  lastCodemodHashDigests: withFallback(t.readonlyArray(t.string), []),
  executionErrors: withFallback(
    t.record(t.string, t.readonlyArray(executionErrorCodec)),
    {},
  ),
  codemodDiscoveryView: withFallback(
    buildTypeCodec({
      executionPaths: t.record(t.string, t.string),
      focusedCodemodHashDigest: t.union([codemodNodeHashDigestCodec, t.null]),
      expandedNodeHashDigests: t.readonlyArray(codemodNodeHashDigestCodec),
      searchPhrase: t.string,
      panelGroupSettings: panelGroupSettingsCodec,
      codemodArgumentsPopupHashDigest: t.union([
        codemodNodeHashDigestCodec,
        t.null,
      ]),
      codemodArguments: t.record(t.string, t.record(t.string, t.string)),
    }),
    {
      executionPaths: {},
      focusedCodemodHashDigest: null,
      expandedNodeHashDigests: [],
      searchPhrase: "",
      panelGroupSettings: {
        "0,0": [50, 50],
      },
      codemodArgumentsPopupHashDigest: null,
      codemodArguments: {},
    },
  ),
  codemodRunsTab: withFallback(
    buildTypeCodec({
      resultsCollapsed: withFallback(t.boolean, false),
      changeExplorerCollapsed: withFallback(t.boolean, false),
      selectedCaseHash: t.union([caseHashCodec, t.null]),
      panelGroupSettings: panelGroupSettingsCodec,
    }),
    {
      resultsCollapsed: false,
      changeExplorerCollapsed: false,
      selectedCaseHash: null,
      panelGroupSettings: {
        "0,0": [50, 50],
      },
    },
  ),
  jobDiffView: withFallback(
    buildTypeCodec({
      visible: withFallback(t.boolean, false),
    }),
    {
      visible: false,
    },
  ),
  sourceControl: withFallback(
    t.union([
      buildTypeCodec({
        kind: t.literal("ISSUE_CREATION"),
        jobHash: t.string,
        oldFileContent: t.string,
        newFileContent: t.string,
        modifiedFileContent: t.union([t.string, t.null]),
      }),
      buildTypeCodec({
        kind: t.literal("ISSUE_CREATION_WAITING_FOR_AUTH"),
        title: t.string,
        body: t.string,
      }),
      buildTypeCodec({
        kind: t.literal("WAITING_FOR_ISSUE_CREATION_API_RESPONSE"),
        title: t.string,
        body: t.string,
      }),
      buildTypeCodec({
        kind: t.literal("IDLENESS"),
      }),
    ]),
    {
      kind: "IDLENESS",
    },
  ),
  toaster: withFallback(
    t.union([
      buildTypeCodec({
        containerId: t.string,
        toastId: t.string,
        content: t.string,
        autoClose: t.number,
      }),
      t.null,
    ]),
    null,
  ),
  caseHashJobHashes: withFallback(t.readonlyArray(t.string), []),
  caseHashInProgress: withFallback(t.union([caseHashCodec, t.null]), null),
  applySelectedInProgress: withFallback(t.boolean, false),
  activeTabId: withFallback(activeTabIdCodec, "codemods"),
  explorerSearchPhrases: withFallback(t.record(caseHashCodec, t.string), {}),
  selectedExplorerNodes: withFallback(
    t.record(caseHashCodec, t.readonlyArray(_explorerNodeHashDigestCodec)),
    {},
  ),
  collapsedExplorerNodes: withFallback(
    t.record(caseHashCodec, t.readonlyArray(_explorerNodeHashDigestCodec)),
    {},
  ),
  reviewedExplorerNodes: withFallback(
    t.record(caseHashCodec, t.readonlyArray(_explorerNodeHashDigestCodec)),
    {},
  ),
  focusedExplorerNodes: withFallback(
    t.record(caseHashCodec, _explorerNodeHashDigestCodec),
    {},
  ),
  indeterminateExplorerNodes: withFallback(
    t.record(caseHashCodec, t.readonlyArray(_explorerNodeHashDigestCodec)),
    {},
  ),
});

export type RootState = t.TypeOf<typeof persistedStateCodecNew>;
