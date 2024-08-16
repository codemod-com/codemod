"use client";

import { useHideMenu } from "@/components/global/useHideMenu";
import type { GlobalPagePayload } from "@/types";
import { cn } from "@/utils";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Navigation from "./Navigation";
import PlatformHeader from "./PlatformHeader";

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

  const isPlatformPage = pathname.startsWith("/campaigns");

  return (
    <div
      className={cn(
        "flex min-h-svh w-full flex-col items-center justify-between",
        className,
      )}
    >
      {/* @TODO refactor this logic */}
      {isPlatformPage ? (
        <PlatformHeader />
      ) : (
        !hideMenu && data && <Navigation data={data.navigation} />
      )}
      {}

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
