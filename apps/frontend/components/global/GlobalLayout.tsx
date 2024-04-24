"use client";

import { useHideMenu } from "@/components/global/useHideMenu";
import type { GlobalPagePayload } from "@/types";
import { cn } from "@/utils";
import Footer from "./Footer";
import Navigation from "./Navigation";

export default function GlobalLayout({
  data,
  children,
  className = "justify-between",
}: {
  data: GlobalPagePayload;
  className?: string;
  children: any;
}) {
  const hideMenu = useHideMenu();
  return (
    <div
      className={cn(
        "flex min-h-svh w-full flex-col items-center justify-between",
        className,
      )}
    >
      {!hideMenu && data && <Navigation data={data.navigation} />}
      <main className={cn("w-full", !hideMenu && "max-w-[1312px]")}>
        {children}
      </main>
      {!hideMenu && data && <Footer data={data.footer} />}
    </div>
  );
}
