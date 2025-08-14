"use client";

import Tag from "@/components/shared/Tag";

import type { RegistryCardData } from "@/types/object.types";
import {  getDescriptionShortText, getFilterIcon, getFilterSection } from "./helpers";
import { Calendar, Download, Hash, Star, User } from "lucide-react";
import { TooltipContent, Tooltip, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";


export default function RegistrySectionCard(
  props: RegistryCardData & {
    onFilter: (key?: string | null, value?: string | null) => void;
  },
) {
  const organization = props.organization;
  const owner = props.owner;
  const pkg = props.pkg;

  const pkgName = pkg?.name ?? props.name ?? props.slug;
  const pkgScope = pkg?.scope ?? undefined;

  const downloadCount = pkg?.downloadCount ?? props.amountOfUses ?? 0;
  const starCount = pkg?.starCount ?? props.openedPrs ?? 0;

  const formattedDescription = getDescriptionShortText(
    props.shortDescription || "",
  );

  const authorIcons = getFilterSection("author", props.filterIconDictionary);
  const authorImage = getFilterIcon(authorIcons, props.author);

  const latestVersion = pkg?.latestVersion ?? props.versions?.[props.versions.length - 1]?.version;
  const dateSource = pkg?.updatedAt ?? props.updatedAt;
  const formattedDate = dateSource
    ? new Date(dateSource).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : undefined;

  return (
    <li className="hover:border-accent rounded-xl border-border-light dark:border-border-dark border flex h-full cursor-pointer flex-col px-5 py-4 transition-all hover:shadow-lg">
      <div className="mb-2 p-0">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          
          <h3 className="font-semibold tracking-tight truncate text-base">
            {pkgScope && (
              <span className="text-secondary-light dark:text-secondary-dark font-mono">
                {pkgScope}/
              </span>
            )}
            {pkgName}
          </h3>
          {latestVersion && (
            <div className="inline-flex w-fit items-center justify-center gap-1 overflow-hidden rounded-2xl border border-border-light dark:border-border-dark pb-0.5 text-xs font-medium transition-colors focus-visible:ring-[3px] [&>svg]:pointer-events-none bg-background text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground h-5 min-w-5 px-1 tabular-nums [&>svg]:ms-0 [&>svg]:-mb-0.5 [&>svg]:size-3 shrink-0 whitespace-nowrap">
              <span className="font-mono">v{latestVersion}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-0">
        <p className="text-foreground mb-3 line-clamp-2 flex-1 text-sm">
          {formattedDescription}
        </p>

        <div className="mb-4 flex flex-wrap gap-1">
          {(pkg?.keywords ?? props.tags ?? []).slice(0, 2).map((keyword) => (
            <div className="inline-flex w-fit items-center justify-center gap-1 overflow-hidden rounded-2xl border pb-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:-mb-0.5 [&>svg]:size-3 bg-accent/10 text-accent border-transparent h-5 px-1.5 shrink-0" key={keyword}>
              <Hash className="h-3 w-3" />
              {keyword}
            </div>
          ))}
          {((pkg?.keywords?.length ?? props.tags?.length ?? 0) > 2) ? (
            <div className="inline-flex w-fit items-center justify-center gap-1 overflow-hidden rounded-2xl border pb-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:-mb-0.5 [&>svg]:size-3 bg-accent/10 text-accent border-transparent h-5 px-1.5 shrink-0">
              +{(pkg?.keywords?.length ?? props.tags?.length ?? 0) - 2}
            </div>
          ) : null}
        </div>

        <div className="text-secondary-light dark:text-secondary-dark flex items-center justify-between text-xs">
          <TooltipProvider>
            <div className="flex items-center gap-3">
              {props.isLegacy && (
                <Tag intent="static">Legacy</Tag>
              )}

              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {organization?.slug ?? owner?.username}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Publisher</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {downloadCount.toLocaleString()}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Downloads</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {starCount}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Stars</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </li>
  );
}
