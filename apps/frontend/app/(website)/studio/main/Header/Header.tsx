import useFeatureFlags from "@/hooks/useFeatureFlags";
import { CODEMOD_RUN_FEATURE_FLAG } from "@/utils/strings";
import { GHRunButton } from "@features/GHRun";
import { DownloadZip } from "../DownloadZip";
import { TopBar } from "./TopBar";
import { HeaderButtons } from "./headerButtons";

export const Header = () => {
  const ffs = useFeatureFlags();

  return (
    <>
      <TopBar />
      <div className="flex justify-between items-center h-[40px] w-full p-1 px-4">
        <div />
        <div className="flex gap-2 items-center">
          {ffs.includes(CODEMOD_RUN_FEATURE_FLAG) && <GHRunButton />}
          <HeaderButtons />
          <DownloadZip />
        </div>
      </div>
    </>
  );
};
