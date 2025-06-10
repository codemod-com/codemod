"use client";
import { cn } from "@/utils";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { AnimatedGradientLink } from "./AnimatedGradientText";

export const BannerLink = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (!isHomePage) return null;
  return (
    <AnimatedGradientLink href="https://app.codemod.com/pages/insights" className="inline-flex gap-2">
      <span
        className={cn(
          `animate-gradient inline bg-gradient-to-r dark:from-accent dark:via-info-light dark:to-accent from-success-dark via-info-dark font-bold dark:font-medium to-success-dark bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
        )}
      >
        New: Codemod Insights for engineering leaders
      </span>
      <ChevronRight className="size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
    </AnimatedGradientLink>
  );
};
