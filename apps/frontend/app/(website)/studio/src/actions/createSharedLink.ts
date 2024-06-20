"use server";

import { env } from "@/env";

type CreateSharedLinkResponse = Readonly<{
  id: string;
  domain: string;
  key: string;
  url: string;
  archived: boolean;
  expiresAt: string;
  expiredUrl: string;
  password: string;
  proxy: boolean;
  title: string;
  description: string;
  image: string;
  rewrite: boolean;
  ios: string;
  android: string;
  geo: Record<string, string>;
  publicStats: boolean;
  tagId: string;
  tags: Array<{ id: string; name: string; color: string }>;
  comments: string;
  shortLink: string;
  qrCode: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  userId: string;
  workspaceId: string;
  clicks: number;
  lastClicked: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}>;

type CreateSharedLinkRequest = Readonly<{
  url: string;
  domain?: string;
}>;

export let createSharedLink = async (
  destination: "studio" | "vsce",
  body: CreateSharedLinkRequest,
): Promise<string | null> => {
  if (!env.DUBCO_API_TOKEN || !env.DUBCO_WORKSPACE_ID) {
    return null;
  }

  try {
    let tagsResponse = await fetch(
      `https://api.dub.co/tags?workspaceId=${env.DUBCO_WORKSPACE_ID}`,
      {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${env.DUBCO_API_TOKEN}`,
        },
      },
    );

    let tags = (await tagsResponse.json()) as Array<{
      id: string;
      name: string;
      color: string;
    }>;

    let studioTag = tags.find((tag) => tag.name === destination);

    let response = await fetch(
      `https://api.dub.co/links?workspaceId=${env.DUBCO_WORKSPACE_ID}`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${env.DUBCO_API_TOKEN}`,
        },
        body: JSON.stringify({
          url: body.url,
          domain: body.domain ?? "go.codemod.com",
          tagIds: studioTag ? [studioTag.id] : [],
        }),
      },
    );

    let json = (await response.json()) as CreateSharedLinkResponse;

    return json.shortLink;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export type { CreateSharedLinkRequest, CreateSharedLinkResponse };
