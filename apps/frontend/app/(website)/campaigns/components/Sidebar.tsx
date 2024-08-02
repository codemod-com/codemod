import ThemeSwitcher from "@/components/global/Footer/ThemeSwitcher";
import { useTheme } from "@/hooks/useTheme";
import {
  AreaChartIcon,
  BookOpen,
  HistoryIcon,
  TerminalIcon,
  TextSearch,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import NavLink from "./NavLink";

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
          label: "Campaigns",
          href: "/campaigns",
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

const Sidebar = () => {
  const { topNavLinks } = useSidebarNav();
  const { toggleTheme, theme } = useTheme();
  const pathname = usePathname();

  return (
    <div className="w-[160px] h-full p-[8px] flex flex-col justify-between">
      <ul className="flex flex-col gap-[4px] m-0">
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
      </ul>
      <div className="flex">
        <NavLink href="https://docs.codemod.com/introduction" intent="default">
          <BookOpen size={16} />
          <span>Docs</span>
        </NavLink>
        <ThemeSwitcher toggleTheme={toggleTheme} isLight={theme === "light"} />
      </div>
    </div>
  );
};

export default Sidebar;
