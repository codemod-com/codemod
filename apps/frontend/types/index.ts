import type {
  ArbitraryTypedObject,
  PortableTextBlock,
} from "@portabletext/types";
import type { SanityImageObject } from "@sanity/image-url/lib/types/types";

import type { IconId, TechLogoId } from "@/components/shared/Icon";
import type { CTAData } from "./generic.types";
import type {
  AutomationFilter,
  AutomationFilterIconDictionary,
  AutomationImportSchema,
  AutomationResponse,
  BlogArticleCardData,
  GlobalLabels,
  LogoDarkLight,
  MuxVideo,
  PageCta,
  PageCtaDouble,
  PageCtaTriple,
  PageHeroProps,
} from "./object.types";

// Templates
export type BaseRouteTemplateProps = {
  _id: string;
  _type: string;
  pathname?: string;
};

export type BasicPageDocumentPayload = BaseRouteTemplateProps & {
  title?: string;
  seo?: SEOData;
  publishStatus?: PublishStatus;
  fallBackOGImage?: SanityImageObject;
};

export type MinimalDocForPath = {
  _type: string | undefined;
  _id?: string;
  pathname?: string;
};

// Pages
export type ModularPagePayload = BasicPageDocumentPayload & {
  hero?: PageHeroProps;
  sections?: SectionsBody;
  initialAutomations?: AutomationResponse[];
  cta?: PageCta | PageCtaDouble | PageCtaTriple;
};

export type ContactPagePayload = BaseRouteTemplateProps & {
  title?: string;
  description?: string;
  formFields?: {
    name?: string;
    namePlaceholder?: string;
    email?: string;
    emailPlaceholder?: string;
    company?: string;
    companyPlaceholder?: string;
    message?: string;
    messagePlaceholder?: string;
    privacy?: string;
    privacyLink?: string;
    privacyLabel?: string;
    submit?: string;
  };
  cta?: PageCta | PageCtaDouble | PageCtaTriple;
};

export type TextPagePayload = BasicPageDocumentPayload & {
  title: string;
  lastUpdatedText?: string;
  tocTitle: string;
  body: BlocksBody;
};

export type PricingPagePayload = BasicPageDocumentPayload & {
  hero: PageHeroProps;
  plans: Plan[];
  sections?: SectionsBody;
  cta?: PageCta | PageCtaDouble | PageCtaTriple;
};

export type Plan = {
  title?: string;
  icon?: IconId;
  price?: string;
  priceNotes?: string;
  planDescription?: BlocksBody;
  targetPlanDescription?: BlocksBody;
  featuresTitle?: string;
  features?: string[];
  cta?: {
    link?: string;
    label?: string;
  };
};

export type AboutPagePayload = BasicPageDocumentPayload & {
  hero: PageHeroProps;
  paragraphTitle: string;
  paragraphContent: BlocksBody;
  teamTitle: string;
  teamMembers: TeamMember[];
  companies: PageHeroProps;
  investorsTitle: string;
  investorsSubtitle: BlocksBody;
  investors: Investor[];
  cta?: PageCta | PageCtaDouble | PageCtaTriple;
};

export type TeamMember = {
  image?: SanityImageObject & { alt?: string };
  name?: string;
  role?: string;
  bio?: BlocksBody;
  linkedin?: string;
  twitter?: string;
  previousCompany?: string;
  previousCompanyLogo?: LogoDarkLight;
};

export type Investor = {
  image: SanityImageObject & { alt?: string };
  name: string;
  role: string;
  companyLogo: LogoDarkLight;
};

export type NotFoundPayload = BasicPageDocumentPayload & {
  title?: string;
  description?: string;
  heroCta: {
    link: string;
    label: string;
  };
  footerCta?: PageCta | PageCtaDouble | PageCtaTriple;
};
export type ErrorPayload = BasicPageDocumentPayload & {
  title?: string;
  description?: string;
  heroCta: {
    link: string;
    label: string;
  };
};

export type CareersPagePayload = BasicPageDocumentPayload & {
  title: string;
  subtitle: BlocksBody;
  jobs: Job[];
  cta?: PageCta | PageCtaDouble | PageCtaTriple;
};

export type Job = BasicPageDocumentPayload & {
  pathname: { current: string };
  active: boolean;
  title: string;
  location: string;
  department: string;
  post: BlocksBody;
  globalLabels: GlobalLabels["careers"];
  privacyPolicy: CTAData;
  relatedPositions: Job[];
};

export type RouteProps = {
  params: { path: string[] | string; locale: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export type RoutePayload = {
  routeData: {
    _type: string;
    _id: string;
    pathname: string;
    // locale: string;
  };
};

// Sections
export type SectionsBody = SectionInRenderer[];

export type SectionInRenderer = {
  _key: string;
  _type: string;

  /**
   * Index in the parent array.
   * @remarks injected by BlocksRenderer.tsx
   */
  _sectionIndex?: number;

  /**
   * Sibling blocks.
   * @remarks injected by BlocksRenderer.tsx
   */
  _sections?: any[];

  /**
   * Data to be spread on the root HTML element of the block
   * @remarks injected by BlocksRenderer.tsx
   */
  rootHtmlAttributes: {
    "data-section": string;
    id: string;
  };
};

export type TestiomonialsProps = SectionInRenderer & {
  title: string;
  paragraph: BlocksBody;
  items: Testimonial[];
};

export type Testimonial = {
  companyLogoLight: SanityImageObject & { alt?: string };
  companyLogoDark: SanityImageObject & { alt?: string };
  quote: BlocksBody;
  image: SanityImageObject & { alt?: string };
  name: string;
  role: string;
};

export type Feature = {
  _key?: string;
  size: "small" | "large";
  title: string;
  description: string;
  tag?: string;
  snippet?: string;
  toastText?: string;
  cta?: SanityLinkType;
  bgVideo?: {
    light?: MuxVideo;
    dark?: MuxVideo;
  };
};

export type Tag = {
  label: string;
  icon?: {
    position: "left" | "right";
    icon: string;
  };
};

// Components
export type SanityLinkType = {
  href?: string;
  label?: string;
};

export type BlocksBody = (PortableTextBlock | ArbitraryTypedObject)[];

export type SEOData = {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  image?: SanityImageObject;
};

export enum PublishStatus {
  hidden = "hidden",
  public = "public",
}

export const PublishStatusOptions = [
  {
    value: PublishStatus.hidden,
    title: "Hidden (won't show up in Google, but accessible through URL)",
  },
  {
    value: PublishStatus.public,
    title: "Public",
  },
];

// Global
export type PagePayload<T extends BasicPageDocumentPayload | null> = {
  pageData: T;
};

export type GlobalPagePayload = {
  navigation: NavigationPayload;
  fallbackOGImage: SanityImageObject;
  footer: FooterPayload;
};

export type NavigationPayload = {
  navigationItems: {
    _key: string;
    _type: string;
    href: string;
    label: string;
  }[];
  announcementBar?: {
    enabled?: boolean;
    dismissable?: boolean;
    message?: BlocksBody;
  };
  navigationCtas?: {
    _key: string;
    _type: string;
    href: string;
    label: string;
  }[];
};

export type FooterPayload = {
  footerText: BlocksBody;
  footerNavigationItems: FooterNavigationItem[];
  socialLinks: {
    _key: string;
    link: {
      label: string;
      href: string;
    };
    logo: TechLogoId;
  }[];
};

export type FooterNavigationItem = {
  _key: string;
  _type: string;
  submenu: string;
  links: SanityLinkType[];
};

export type BlogArticlePayload = BasicPageDocumentPayload & {
  seo?: SEOData;
  tagline?: string;
  publishStatus?: PublishStatus;
  body?: BlocksBody;
  pageCta?: PageCta | PageCtaDouble | PageCtaTriple;
  publishedAt?: string;
  readTime?: number;
  globalLabels?: GlobalLabels["blog"];
  tags?: {
    _id: string;
    title: string;
    slug: {
      current: string;
    };
  }[];
  authors?: {
    _key: string;
    name: string;
    details?: string;
    socialUrl?: string;
    image: SanityImageObject;
  }[];
  relatedArticles?: Array<BlogArticleCardData>;
  showToc?: boolean;
  sidebar?: CustomerStorySidebar | BlogArticleSidebar;
};

export type CodemodPagePayload = BasicPageDocumentPayload &
  AutomationImportSchema & {
    globalLabels?: GlobalLabels["codemodPage"];
  };

export type BlogArticleSidebar = {
  showToc?: boolean;
  showRelatedArticles?: boolean;
};

export type CustomerStorySidebar = {
  showArticleCta?: boolean;
  showRelatedArticles?: boolean;
  articleCta?: {
    title?: string;
    subtitle?: string;
    cta?: { link?: string; label?: string };
  };
  stats?: Array<{
    _key: string;
    from: string;
    to: string;
    useFromTo: boolean;
    subtitle: string;
  }>;
  features?: Array<{
    _key: string;
    title: string;
    logo: string;
    url?: string;
  }>;
};

export type BlogIndexPayload = BasicPageDocumentPayload & {
  emptyStateText?: string;
  searchPlaceholder?: string;
  defaultFilterTitle?: string;
  cta: PageCta | PageCtaDouble | PageCtaTriple;
  featuredPosts?: Array<BlogArticleCardData>;
  collectionTitle?: string;
  blogTags?: {
    _id: string;
    title: string;
    slug: {
      current: string;
    };
    featuredPosts?: Array<BlogArticleCardData>;
  }[];
  entries: Array<
    BasicPageDocumentPayload & {
      tags?: {
        _id: string;
        title: string;
        slug: {
          current: string;
        };
      }[];
      authors?: {
        _id: string;
        name: string;
      }[];
    }
  >;
  entriesCount: number;
};

export type Automation = BasicPageDocumentPayload & AutomationImportSchema;

export type RegistryIndexPayload = BasicPageDocumentPayload & {
  entries?: AutomationResponse[];
  entriesCount?: number;

  automationFilters?: AutomationFilter[];
  filterIconDictionary?: AutomationFilterIconDictionary;
  entriesPerPage?: number;
  total?: number;
  placeholders?: {
    emptyStateText?: string;
    searchPlaceholder?: string;
    totalCodemodsSuffix?: string;
    verifiedAutomationTooltip?: string;
  };
};

export type RegistryTotal = Pick<
  AutomationImportSchema,
  | "_id"
  | "author"
  | "automationName"
  | "featured"
  | "verified"
  | "private"
  | "useCaseCategory"
  | "applicability"
>;

export type RouteSearchParams = {
  [key: string]: string | string[] | undefined;
};
