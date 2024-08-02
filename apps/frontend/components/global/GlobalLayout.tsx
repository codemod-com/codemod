"use client";

import { useHideMenu } from "@/components/global/useHideMenu";
import type { GlobalPagePayload } from "@/types";
import { cn } from "@/utils";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex min-h-svh w-full flex-col items-center justify-between",
        className,
      )}
    >
      {!hideMenu && data && <Navigation data={data.navigation} />}
      {/* @TODO refactor this logic */}
      <main
        className={cn(
          "w-full",
          !hideMenu && pathname !== "/campaigns" && "max-w-[1312px]",
        )}
      >
        {children}
      </main>
      {!hideMenu && data && <Footer data={data.footer} />}
    </div>
  );
}
