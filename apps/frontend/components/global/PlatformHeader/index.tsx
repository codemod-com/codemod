import AuthButtons from "@/app/auth/AuthButtons";
import { usePathname } from "next/navigation";
import LogoWithContextMenu from "../Navigation/LogoWithContextMenu";

const PlatformHeader = () => {
  const pathname = usePathname();

  return (
    <div className="w-full h-[52px] py-2 px-4 flex justify-between border-b border-emphasis-light">
      <LogoWithContextMenu />
      <AuthButtons variant="www" redirectUrl={pathname} />
    </div>
  );
};

export default PlatformHeader;
