"use client";
import ThemeSwitcher from "@/components/global/Footer/ThemeSwitcher";
import Logo from "@/components/shared/Logo";
import NavLink from "@/components/shared/NavLink";
import { useTheme } from "@/hooks/useTheme";
import { useViewStore } from "@/store/view";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import {
  AreaChartIcon,
  BookOpen,
  HistoryIcon,
  TerminalIcon,
  TextSearch,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const client = new QueryClient();

const useSidebarNav = () => {
  const sidebarNav = useMemo(
    () => ({
      topNavLinks: [
        {
          label: "Studio",
          href: "/studio",
          Icon: TerminalIcon,
        },
        {
          label: "Registry",
          href: "/registry",
          Icon: TextSearch,
        },
        {
          label: "Insights",
          href: "/insights",
          Icon: AreaChartIcon,
        },
        {
          label: "Runs",
          href: "/runs",
          Icon: HistoryIcon,
        },
      ],
    }),
    [],
  );

  return sidebarNav;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarActive, setIsSidebarActive } = useViewStore();

  const { topNavLinks } = useSidebarNav();
  const { toggleTheme, theme } = useTheme();
  const pathname = usePathname();

  return (
    <Theme>
      <QueryClientProvider client={client}>
        <div className="h-full">
          <div>
            {/* Mobile sidebar */}
            {/* <div className="relative z-50 lg:hidden">
              <Sheet open={isSidebarActive} onOpenChange={setIsSidebarActive}>
                <div className="fixed inset-0 flex">
                  <SheetContent className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full">
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                      <button
                        type="button"
                        onClick={() => setIsSidebarActive(false)}
                        className="-m-2.5 p-2.5"
                      >
                        <span className="sr-only">Close sidebar</span>
                        <X aria-hidden="true" className="h-6 w-6 text-white" />
                      </button>
                    </div>

                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                      <div className="flex h-16 shrink-0 items-center">
                        <Logo />
                      </div>
                      <nav className="flex flex-1 flex-col">
                        <ul className="flex flex-1 flex-col gap-y-7">
                          {topNavLinks.map(({ href, label, Icon }) => (
                            <li key={href}>
                              <NavLink
                                href={href}
                                intent={
                                  pathname === href ? "active" : "default"
                                }
                                prefetch
                              >
                                <Icon size={16} />
                                <span>{label}</span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                  </SheetContent>
                </div>
              </Sheet>
            </div> */}

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-48 lg:flex-col">
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
                <div className="flex h-16 shrink-0 items-center">
                  <Logo />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col ml-0">
                    {topNavLinks.map(({ href, label, Icon }) => (
                      <li key={href}>
                        <NavLink
                          href={href}
                          intent={pathname === href ? "active" : "default"}
                          prefetch
                        >
                          <Icon size={16} />
                          <span>{label}</span>
                        </NavLink>
                      </li>
                    ))}

                    <li className="flex mt-auto mb-2 gap-2">
                      <NavLink
                        href="https://docs.codemod.com/introduction"
                        intent="default"
                      >
                        <BookOpen size={16} />
                        <span>Docs</span>
                      </NavLink>
                      <ThemeSwitcher
                        toggleTheme={toggleTheme}
                        isLight={theme === "light"}
                      />
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            <main className="lg:pl-48">
              <div className="">{children}</div>
            </main>
          </div>
        </div>
      </QueryClientProvider>
    </Theme>
  );
};

export default Layout;
