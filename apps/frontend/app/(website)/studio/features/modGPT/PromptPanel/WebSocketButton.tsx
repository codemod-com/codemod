import { useTranslation, Trans } from "react-i18next";
import type { useAiService } from "@chatbot/useAiService";
import type { useCodemodAI } from "@chatbot/useAiService/codemodAI/useCodemodAI";
import ButtonWithTooltip from "@studio/components/button/BottonWithTooltip";
import Link from "next/link";

export const WebSocketButton = ({
  handleButtonClick,
  isLoading,
}: {
  handleButtonClick: ReturnType<
    typeof useCodemodAI
  >["startIterativeCodemodGeneration"];
  isLoading: ReturnType<typeof useAiService>["isLoading"];
}) => {
const { t } = useTranslation("(website)/studio/features/modGPT/PromptPanel");

  return (
    <ButtonWithTooltip
      tooltipContent={
        <><Trans
i18nKey="with-selected-model-and-codemods-iterative-ai-system"
components={{"0": <Link
            style={{ color: "blue" }}
            href="https://codemod.com/blog/iterative-ai-system"
           />}}
/>
        </>
      }
      variant="default"
      size="sm"
      className="text-white flex gap-1 text-xs my-0 h-8 !py-0 bg-black hover:bg-accent hover:text-black"
      // className="group my-0 h-8 whitespace-nowrap !py-0 text-xs font-bold bg-primary"
      onClick={handleButtonClick}
      disabled={isLoading}
    >{t('autogenerate-with-codemod-ai')}</ButtonWithTooltip>
  );
};
