"use client";

import Tag from "@/components/shared/Tag";

import type { RegistryCardData } from "@/types/object.types";
import { getAutomationPathname, getDescriptionShortText } from "./helpers";
import { Calendar, Download, Hash, Star, User } from "lucide-react";
import {
  TooltipContent,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Icon from "@/components/shared/Icon";
import Link from "next/link";

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

  const authorImage = props.organization?.avatarUrl || props.owner?.avatarUrl;

  const latestVersion =
    pkg?.latestVersion ?? props.versions?.[props.versions.length - 1]?.version;
  const dateSource = pkg?.updatedAt ?? props.updatedAt;
  const formattedDate = dateSource
    ? new Date(dateSource).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : undefined;

  return (
    <Link
      href={getAutomationPathname(props.slug)}
      target="_blank"
      className="flex h-full cursor-pointer flex-col rounded-xl border border-border-light px-5 py-4 transition-all hover:border-[#7faa09] hover:shadow-lg dark:border-border-dark dark:hover:border-accent"
    >
      <div className="mb-2 p-0">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              className="rounded-[4px]"
              src={authorImage ?? undefined}
              alt={authorImage ?? undefined}
            />
            <AvatarFallback>
              <Icon name="user" className="h-4 w-4 opacity-60" />
            </AvatarFallback>
          </Avatar>
          <h3 className="truncate text-base font-semibold tracking-tight">
            {pkgScope && (
              <span className="font-mono text-secondary-light dark:text-secondary-dark">
                {pkgScope}/
              </span>
            )}
            {pkgName}
          </h3>
          {latestVersion && (
            <div className="[a&]:hover:text-accent-foreground inline-flex h-5 w-fit min-w-5 shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-2xl border border-border-light bg-background px-1 pb-0.5 font-medium text-xs tabular-nums text-foreground transition-colors focus-visible:ring-[3px] dark:border-border-dark [&>svg]:pointer-events-none [&>svg]:-mb-0.5 [&>svg]:ms-0 [&>svg]:size-3 [a&]:hover:bg-accent">
              <span className="font-mono">v{latestVersion}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-0">
        <p className="mb-3 line-clamp-2 flex-1 text-sm text-foreground">
          {formattedDescription}
        </p>

        <div className="mb-4 flex flex-wrap gap-1">
          {(pkg?.keywords ?? props.tags ?? []).slice(0, 2).map((keyword) => (
            <div
              className="inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-2xl border border-transparent bg-[#7faa09]/10 px-1.5 pb-0.5 font-medium text-xs text-[#7faa09] transition-colors focus-visible:ring-[3px] dark:bg-accent/10 dark:text-accent [&>svg]:pointer-events-none [&>svg]:-mb-0.5 [&>svg]:size-3"
              key={keyword}
            >
              <Hash className="h-3 w-3" />
              {keyword}
            </div>
          ))}
          {(pkg?.keywords?.length ?? props.tags?.length ?? 0) > 2 ? (
            <div className="inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-2xl border border-transparent bg-[#7faa09]/10 px-1.5 pb-0.5 font-medium text-xs text-[#7faa09] transition-colors focus-visible:ring-[3px] dark:bg-accent/10 dark:text-accent [&>svg]:pointer-events-none [&>svg]:-mb-0.5 [&>svg]:size-3">
              +{(pkg?.keywords?.length ?? props.tags?.length ?? 0) - 2}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs text-secondary-light dark:text-secondary-dark">
          <TooltipProvider>
            <div className="flex items-center gap-3">
              {props.isLegacy && <Tag intent="static">Legacy</Tag>}

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
    </Link>
  );
}
