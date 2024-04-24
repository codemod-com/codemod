import type { Feature, SectionInRenderer } from ".";
import type {
  AutomationFilter,
  AutomationFilterIconDictionary,
  MediaTab,
  RegistryCardData,
} from "./object.types";

// ===================================
// ============= SECTIONS ==============
// ===================================

export type FeaturesProps = SectionInRenderer & {
  features: Feature[];
};

export type SectionFullWidthMediaProps = SectionInRenderer & {
  title: string;
  subtitle: string;
  mediaTabs: MediaTab[];
};

export type SectionRegistryProps = {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  initialAutomationSlugs?: string[];
  initialAutomations?: RegistryCardData[];
  filterIconDictionary?: AutomationFilterIconDictionary;
  verifiedAutomationTooltip?: string;
  filter?: AutomationFilter;
  automationFilter?: string;
  ctaLabel?: string;
};

// %CLI/INJECT-BLOCK-TYPE%
