import { CUSTOMER_STORY_TAG, REGISTRY_FILTER_TYPES } from "@/constants";
import { groq } from "next-sanity";

export const REGISTRY_CARD_FRAGMENT = groq`
_id,
_type,
automationName,
author,
applicability,
shortDescription,
verified,
featured,
useCaseCategory,
verifiedTooltip,
"pathname": pathname.current,
`;

const MUX_VIDEO_FRAGMENT = groq`
    {
        asset->{
            "resolution": data.max_stored_resolution,
            playbackId,
        }
    }
`;

const FULL_WIDTH_MEDIA_FRAGMENT = groq`
    ...,
    mediaTabs[]{
        ...,
        mediaItem[]{
          ...,
          video ${MUX_VIDEO_FRAGMENT},
          darkVideo ${MUX_VIDEO_FRAGMENT},
        }
    },
`;

const SECTIONS_FRAGMENT = groq`
    ...,
    _type == "section.features" => {
        ...,
        _key,
        _type,
        _id,
        features {
            ...,
            bgVideo {
              light ${MUX_VIDEO_FRAGMENT},
              dark ${MUX_VIDEO_FRAGMENT},
            },

        }[]
    },
    _type == "section.fullWidthMedia" => {
        ${FULL_WIDTH_MEDIA_FRAGMENT}
    },

    _type == "section.registry" => {
        ...,
        "filterIconDictionary": *[_type == "filterIconDictionary"][0],
        "verifiedAutomationTooltip": *[_type == "registryIndex"][0].placeholders.verifiedAutomationTooltip,
    },
`;

const PT_BLOCK_FRAGMENT = groq`
    ...,
   _type == "muxVideoWithCaption" => {
        ...,
        video ${MUX_VIDEO_FRAGMENT},
        darkVideo ${MUX_VIDEO_FRAGMENT},
   },
`;

const FILTER_ICON_DICTONARY_FRAGMENT = groq`
*[_type == "filterIconDictionary"][0]
`;

export const NAVIGATION_QUERY = groq`
    *[_type == "navigation"][0]
`;

export const FOOTER_QUERY = groq`
    *[_type == "footer"][0]
`;

export const PAGE_QUERY = groq`*[_type == "page" && pathname.current == $pathname][0]{
    ...,
    'pathname': pathname.current,
    sections {
        ${SECTIONS_FRAGMENT}
    }[],
    cta-> {
        ...
    }
}`;

export const CONTACT_PAGE_QUERY = groq`*[_type == "contact"][0] {
    ...,
    sections {
        ${SECTIONS_FRAGMENT}
    }[],
    cta-> {
        ...
    }
}`;

export const PRICING_PAGE_QUERY = groq`*[_type == 'pricingPage'][0]{
    ...,
    sections {
        ${SECTIONS_FRAGMENT}
    }[],
    cta-> {
        ...
    }
}`;

export const ABOUT_PAGE_QUERY = groq`*[_type == 'about'][0]{
    ...,
    cta-> {
        ...
    }
}`;

export const CAREERS_PAGE_QUERY = groq`*[_type == 'careers'][0]{
    ...,
    "jobs": *[_type == "job" && active == true][] {
        ...
    },
    cta-> {
        ...
    }
}`;

export const JOB_QUERY = groq`*[_type == 'job' && pathname.current == $pathname][0]{
    ...,
    "globalLabels": *[_type == "globalLabels"][0].careers,
    relatedPositions[]-> {
        ...
    }
}`;

export const TEXT_PAGE_QUERY = groq`
    *[_type == 'textPage' && pathname.current == $pathname][0] {
        ...,
        'pathname': pathname.current,
        body[] {${PT_BLOCK_FRAGMENT}},
    }
    `;

export const ROUTE_QUERY = groq`
  *[pathname.current == $pathname][0] {
    'routeData': {
      ...,
      'pathname': pathname.current,
    },
  }
`;

const SIDEBAR_FRAGMENT = groq`
...,
"features": features[]-> {
  ...,
},
showArticleCta == true => {
  "articleCta": *[_type == "articleCta"][0] {
    ...,
  }
},

`;

export const BLOG_ARTICLE_QUERY = groq`
  *[_type in ["blog.article", "blog.customerStory"] && pathname.current == $pathname][0] {
    ...,
    "globalLabels": *[_type == "globalLabels"][0].blog,
    'pathname': pathname.current,
    tags[]-> {
      ...,
      featuredPosts[]-> {
        ...,
      },
    },
    'authors': authors[]-> {
      ...,
    },
    "readTime": round(length(pt::text(body)) / 5 / 180 ),

    body[] {${PT_BLOCK_FRAGMENT}},
    sidebar {
      ${SIDEBAR_FRAGMENT}
    },
    pageCta-> {
      ...
    },
    "relatedArticles": *[_type in ["blog.article", "blog.customerStory"] && _id != ^._id] {
      ...,
      "pathname": pathname.current,
      tags[]-> {
        ...,
      },
      'authors': authors[]-> {
        name,
      },

      "score": count(tags[_ref in ^.^.tags[]._ref])
    } | order(date desc) | order(score desc)  [0...2]
  }
`;

export const AUTOMATION_STORIES = groq`
*[_type == "blog.customerStory" && defined(automationTags) && 
  count(automationTags[@ in $aTags]) > 0] 
  | score(automationTags match $aTags)
  | order(_score desc) {  
    title,
    tagline,
    "pathname":pathname.current,
  _score
  }[0..1]
  `;

export const AUTOMATION_PAGE_QUERY = groq`
{
"filterIconDictionary": ${FILTER_ICON_DICTONARY_FRAGMENT},
"globalLabels": *[_type == "globalLabels"][0].codemodPage,
}
`;
// To be added later once we finalize linking to automations
// "automationStories": ${AUTOMATION_STORIES},

export function buildBlogIndexQuery({
  entriesPerPage = 10,
  infiniteLoading = false,
  pathParam,
  pageNumber = 1,
  sortBy,
  sortOrder,
}: {
  entriesPerPage?: number;
  pathParam?: string;
  infiniteLoading?: boolean;
  pageNumber?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  const tag = pathParam;
  const pageStart = infiniteLoading ? 0 : entriesPerPage * (pageNumber - 1);
  const pageEnd = entriesPerPage * pageNumber;
  const isCustomerStory = pathParam === CUSTOMER_STORY_TAG.value;
  const filters = [
    // customer story filter
    isCustomerStory ? `_type == "blog.customerStory"` : null,
    // tags filter
    isCustomerStory
      ? null
      : tag
        ? `defined(tags[]) && count(tags[@->slug.current in ["${tag}"]]) > 0`
        : null,
    // featured posts filter
    isCustomerStory
      ? `!(_id in ^.featuredCustomerStories[]->_id )`
      : tag
        ? `!(_id in *[_type == "blog.tag" && slug.current == "${tag}"].featuredPosts[]->_id)`
        : `!(_id in ^.featuredPosts[]->_id )`,
  ];
  const filtersString = filters.filter(Boolean).join(" && ");
  const orderFragment = `order(${sortBy ?? "_createdAt"} ${
    sortOrder ?? "desc"
  })`;

  const featuredPosts = isCustomerStory
    ? `"featuredPosts": featuredCustomerStories[]-> {
      ${BLOG_ARTICLE_CARD_FRAGMENT}
    },`
    : tag
      ? `"featuredPosts":*[_type == "blog.tag" && slug.current == "${tag}"][0].featuredPosts[]->{
      ${BLOG_ARTICLE_CARD_FRAGMENT}
    },`
      : `featuredPosts[]-> {
      ${BLOG_ARTICLE_CARD_FRAGMENT}
    },`;

  return groq`
    *[_type == "blogIndex" && pathname.current == $pathname][0] {
      ...,
      "blogTags": *[_type == "blog.tag" && count(*[_type == "blog.article" && defined(tags[]) && ^._id in tags[]._ref]) > 0][0..2] {
        ...,
      },
     ${featuredPosts}
      cta-> {
        ...
      },
      "pathname": pathname.current,
      "entries": *[_type in ["blog.article", "blog.customerStory"] ${
        filtersString ? "&& " : ""
      }${filtersString}]
        | ${orderFragment} [${pageStart}...${pageEnd}] {
       ${BLOG_ARTICLE_CARD_FRAGMENT}
        },
      "entriesCount": count(*[_type in ["blog.article", "blog.customerStory"] ${
        filtersString ? "&& " : ""
      }${filtersString}]),
      "entriesPerPage": ${entriesPerPage},
      "pageNum": ${pageNumber},
    }
    `;
}
export function buildRegistryIndexQuery() {
  return groq`
    *[_type == "registryIndex" && pathname.current == $pathname][0] {
      ...,
      "pathname": pathname.current,
      "filterIconDictionary": *[_type == "filterIconDictionary"][0],
    }
    `;
}

export const BLOG_ARTICLE_CARD_FRAGMENT = groq`
...,
"pathname": pathname.current,
"preamble": select(
  defined(preamble) => preamble,
  pt::text(body[_type == "block"][0..2]),
),
'tags': tags[]-> {
  ...,
  "slug": slug.current,
},
'authors': authors[]-> {
  ...,
},
`;

export const NOT_FOUND_DOC_QUERY = groq`
  *[_type == 'notFound'][0] {
    ...,
    footerCta-> {
        ...
    }
  }
`;

export const GLOBAL_QUERY = groq`
    {
      "navigation": ${NAVIGATION_QUERY},
      "fallbackOGImage": *[_type == "settings"][0].fallbackOgImage,
      "footer": ${FOOTER_QUERY}
    }
`;
