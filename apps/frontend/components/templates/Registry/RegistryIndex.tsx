import type { RegistryIndexPayload } from "@/types";
import RegistryInner from "./RegistryInner";
import SearchSection from "./SearchSection";
import { SidebarProvider } from "./context";
export type RegistryIndexProps = {
  data: RegistryIndexPayload;
};

export default function RegistryIndex({ data }: RegistryIndexProps) {
  return (
    <div className="w-full">
      <div className="px-m pb-[80px] pt-[calc(var(--header-height))] lg:px-[64px]">
        <SidebarProvider>
          <SearchSection placeholder={data?.placeholders?.searchPlaceholder} />
          <RegistryInner data={data} />
        </SidebarProvider>
      </div>
    </div>
  );
}
