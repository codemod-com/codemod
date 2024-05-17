import { usePathname } from "next/navigation";

export let useHideMenu = () => {
  let pathname = usePathname();
  let menuLessRoutes = ["/studio", "/sign-in", "/sign-out"];
  return menuLessRoutes.some((route) => pathname.includes(route));
};
