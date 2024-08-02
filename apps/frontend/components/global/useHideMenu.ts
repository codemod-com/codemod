import { usePathname } from "next/navigation";

export const useHideMenu = () => {
  const pathname = usePathname();
  const menuLessRoutes = ["/studio", "/sign-in", "/campaigns"];
  return menuLessRoutes.some((route) => pathname.includes(route));
};
