"use client";
import { cn } from "@/utils";
import { ChevronRight, Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import { AnimatedGradientLink } from "./AnimatedGradientText";

export const BannerLink = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (!isHomePage) return null;
  return (
    <AnimatedGradientLink href="/i18n" className="inline-flex gap-2">
      <Languages className="size-4" />
      <span
        className={cn(
          `animate-gradient inline bg-gradient-to-r dark:from-accent dark:via-info-light dark:to-accent from-success-dark via-info-dark to-success-dark bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
        )}
      >
        New: i18n codemods
      </span>
      <ChevronRight className="size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
    </AnimatedGradientLink>
  );
};
