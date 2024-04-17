import { usePathname } from "next/navigation";

export const useHideMenu = () => {
	const pathname = usePathname();
	return pathname.includes("/studio");
};
