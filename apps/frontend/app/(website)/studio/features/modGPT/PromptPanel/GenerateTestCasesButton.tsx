import { cn } from "@/utils";
import { MagicWand } from "@phosphor-icons/react";
import Tooltip from "@studio/components/Tooltip/Tooltip";
import { useEffect } from "react";
import toast from "react-hot-toast";

export const GenerateTestCasesButton = ({
  handleButtonClick,
  isTestCaseGenerated,
}: {
  handleButtonClick: () => void;
  isTestCaseGenerated: boolean;
}) => {
  useEffect(() => {
    const t = toast;
    if (isTestCaseGenerated) {
      t.loading("Test case generation in progress...");
    } else {
      t.dismiss();
    }
  }, [isTestCaseGenerated]);
  return (
    <Tooltip
      trigger={
        <button
          onClick={handleButtonClick}
          className={cn(
            "cursor-pointer border-hidden align-text-top  p-3 bg-green hover:bg-[#D6FF62]",
            isTestCaseGenerated && "bg-[#D6FF62]",
          )}
        >
          <MagicWand size={"30px"} />
        </button>
      }
      content={
        <p>
          {" "}
          Generate a new pair of before/after based on your existing code
          examples OR based on the natural language description.
        </p>
      }
    />
  );
};
