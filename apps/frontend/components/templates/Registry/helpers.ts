import { loadCodemod } from "@/data/codemod/loaders";
import { type CodemodPagePayload, PublishStatus } from "@/types";
import type {
  AutomationFilter,
  AutomationFilterIconDictionary,
  AutomationFilterType,
  AutomationResponse,
  AutomationStories,
  GlobalLabels,
} from "@/types/object.types";
import { unslugify } from "@/utils/strings";

export function getFormattedDescription(
  description: string,
  returnNonMatching = false,
) {
  let _description = description.match(/##\s?Description([^#]*)##/i)?.[1];

  if (returnNonMatching) {
    let nonMatching = description
      .replace(_description || "", "")
      .replace(/description##/i, "")
      .trim();
    return nonMatching;
  }

  let formattedDescription =
    _description
      ?.replace(
        /`([^`]+)`/g,
        '<code class="code p-px bg-background-light/5 dark:bg-background-dark/50 rounded-sm">$1</code>',
      )
      .trim() || "";
  return formattedDescription;
}

export function getAutomationFramworkTitle(
  automation?: {
    framework?: string | null;
    applicability?: AutomationResponse["applicability"];
  } | null,
) {
  let fw =
    automation?.framework || automation?.applicability?.from?.[0]?.[0] || "";
  let framework = fw.replace(/@/g, "");
  return framework;
}
export function getAutomationPathname(slug: string) {
  return `/registry/${slug}`;
}

export function getFilterSection(
  aFilterId: AutomationFilter["id"],
  filterIconDictionary?: AutomationFilterIconDictionary,
) {
  return filterIconDictionary?.filters?.find(
    (filter) => filter.filterId === aFilterId,
  )?.filterValues;
}

export function getFilterIcon(
  filterValues?: AutomationFilterType["filterValues"],
  id?: string,
) {
  let currentFilter = filterValues?.find(
    (filterValue) => filterValue.filterValue === id,
  );

  return {
    image: {
      dark: currentFilter?.darkModeImage,
      light: currentFilter?.lightModeImage,
    },
    icon: currentFilter?.icon,
  };
}

export async function getInitialAutomations(slugs?: string[]) {
  let defaults = [
    "next-13-remove-get-static-props",
    "react-replace-react-fc-typescript",
    "biome-migrate-rules",
    "ember-5-object-new-constructor",
  ];
  let pathNames = slugs && slugs.length > 0 ? slugs : defaults;

  let automations = (
    await Promise.all(
      pathNames.map(async (pathName) => {
        let automation = await loadCodemod(pathName);
        if ("error" in automation) return null;
        return automation;
      }),
    )
  ).filter(Boolean) as AutomationResponse[];

  return automations;
}

function convertAutomationApplicability(applicability) {
  if (applicability) return;

  return {
    from: applicability?.from.map((f) => ({
      framework: f?.[0],
      comparator: f?.[1],
      version: f?.[2],
    })),
    to: applicability?.to?.map((t) => ({
      framework: t?.[0],
      comparator: t?.[1],
      version: t?.[2],
    })),
  };
}

export function transformAutomation(
  automation: AutomationResponse & {
    automationStories: AutomationStories;
    filterIconDictionary: AutomationFilterIconDictionary;
    globalLabels?: GlobalLabels["codemodPage"];
  },
): CodemodPagePayload {
  let _currentVersion = automation.versions[automation.versions.length - 1];
  if (_currentVersion) {
    _currentVersion.applicability = convertAutomationApplicability(
      _currentVersion?.applicability,
    );
  }
  let currentVersion = _currentVersion;

  return {
    ...automation,
    _id: `imported-automation-${automation.id}`,
    _type: "automation",
    pathname: `/registry/${automation.slug}`,
    internalTitle: unslugify(automation.name),
    publishStatus: automation.private
      ? PublishStatus.hidden
      : PublishStatus.public,
    seo: {
      title: unslugify(automation.name),
    },
    automationName: automation.name,
    automationId: automation.id,
    visible: true,
    currentVersion,
    title: unslugify(automation.name),
  };
}
