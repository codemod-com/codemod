import useFeatureFlags from "@/hooks/useFeatureFlags";
import { RunOptions } from "../RunOptions";
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
          <HeaderButtons />
          <RunOptions />
        </div>
      </div>
    </>
  );
};
