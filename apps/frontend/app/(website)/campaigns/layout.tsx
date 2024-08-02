"use client";
import { useViewStore } from "@/store/view";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { QueryClient, QueryClientProvider } from "react-query";
import Sidebar from "./components/Sidebar";

const client = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarActive } = useViewStore();

  return (
    <Theme>
      <QueryClientProvider client={client}>
        <div className="h-[100vh] pt-[calc(var(--header-height))] flex">
          {isSidebarActive && <Sidebar />}
          <div className="flex-grow h-full overflow-y-auto">{children}</div>
        </div>
      </QueryClientProvider>
    </Theme>
  );
};

export default Layout;
