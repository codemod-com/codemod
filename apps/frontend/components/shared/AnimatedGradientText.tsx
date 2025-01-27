import { cn } from "@/utils";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface AnimatedGradientLinkProps
  extends ComponentPropsWithoutRef<typeof Link> {
  children: ReactNode;
}

export function AnimatedGradientLink({
  children,
  className,
  ...props
}: AnimatedGradientLinkProps) {
  return (
    <Link
      className={cn(
        "group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-3xl bg-white/40 px-4 py-2 text-sm font-medium shadow-[inset_0_-8px_10px_#94ff8f1f] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#8fffa93f] dark:bg-black/40",
        className,
      )}
      {...props}
    >
      <div
        className={`animate-gradient absolute inset-0 block h-full w-full bg-gradient-to-r dark:from-accent dark:via-info-light dark:to-accent from-success-dark via-info-dark to-success-dark bg-[length:var(--bg-size)_100%] p-[1px] [border-radius:inherit] ![mask-composite:subtract] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]`}
      />

      {children}
    </Link>
  );
}
