import { loadCodemod } from "@/data/codemod/loaders";
import { type CodemodPagePayload, PublishStatus } from "@/types";
import type {
  AutomationFilter,
  AutomationFilterIconDictionary,
  AutomationFilterType,
  AutomationResponse,
  AutomationStories,
} from "@/types/object.types";
import { unslugify } from "@/utils/strings";

export function getFormattedDescription(
  description: string,
  returnNonMatching = false,
) {
  const _description = description.match(/##\s?Description([^#]*)##/i)?.[1];

  if (returnNonMatching) {
    const nonMatching = description
      .replace(_description || "", "")
      .replace(/description##/i, "")
      .trim();
    return nonMatching;
  }

  const formattedDescription =
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
    framework?: string;
    applicability?: AutomationResponse["applicability"];
  } | null,
) {
  const fw =
    automation?.framework || automation?.applicability?.from?.[0]?.[0] || "";
  const framework = fw.replace(/@/g, "");
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
  const currentFilter = filterValues?.find(
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
  const defaults = [
    "next-13-remove-get-static-props",
    "react-replace-react-fc-typescript",
    "biome-migrate-rules",
    "ember-5-object-new-constructor",
  ];
  const pathNames = slugs && slugs.length > 0 ? slugs : defaults;

  const automations = (
    await Promise.all(
      pathNames.map(async (pathName) => {
        const automation = await loadCodemod(pathName);
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
  },
): CodemodPagePayload {
  const _currentVersion = automation.versions?.[0];
  if (_currentVersion) {
    for (const key in _currentVersion) {
      if (_currentVersion[key] === null) {
        delete _currentVersion[key];
      }
    }
    _currentVersion.applicability = convertAutomationApplicability(
      _currentVersion?.applicability,
    );
  }
  const currentVersion = _currentVersion;

  return {
    _id: `imported-automation-${automation.id}`,
    _type: "automation",
    pathname: `/registry/${automation.slug}`,
    internalTitle: unslugify(automation.name),
    publishStatus: PublishStatus.public,
    seo: {
      title: unslugify(automation.name),
    },
    shortDescription: automation.shortDescription,
    automationName: automation.name,
    automationId: automation.id,
    featured: !!automation.featured,
    verified: !!automation.verified,
    private: !!automation.private,
    author: automation.author,
    amountOfUses: automation.amountOfUses,
    totalTimeSaved: automation.totalTimeSaved,
    openedPrs: automation.openedPrs,
    createdAt: automation.createdAt,
    updatedAt: automation.updatedAt,
    useCaseCategory: automation.useCaseCategory,
    visible: true,
    applicability: automation.applicability,
    currentVersion,
    filterIconDictionary: automation.filterIconDictionary,
    automationStories: automation.automationStories,
    title: unslugify(automation.name),
    runCommand: "npm run",
  };
}
