import { toPlainText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { slugify, truncate } from "../strings";

export interface DeepLinkData {
  parentDocumentId?: string;
  /**
   * name of the schema field that contains this block
   */
  fieldName?: string;
  /**
   * _key of the target deep-linked block
   */
  sectionKey?: string;
}

export let getPtComponentId = (blocks: PortableTextBlock) => {
  return truncate(slugify(toPlainText(blocks ?? [])), 200);
};

export function getDeepLinkId(deepLink?: DeepLinkData) {
  if (!deepLink?.sectionKey || !deepLink?.fieldName) return;

  return `${deepLink.fieldName}__${deepLink.sectionKey}`;
}

export let getParagraphId = (paragraph: string) => {
  return truncate(slugify(paragraph), 200);
};

export let getTweetId = (url: string) => {
  return url.match(/\/status\/(\d+)/)?.[1];
};
