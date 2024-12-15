import { useTranslation } from "react-i18next";
import Text from "@studio/components/Text";
import { Button } from "@studio/components/ui/button";
import type { WarningTextsProps } from "../";

export const WarningTexts = ({
  snippetBeforeHasOnlyWhitespaces,
  firstCodemodExecutionErrorEvent,
  onDebug,
  codemodSourceHasOnlyWhitespaces,
}: WarningTextsProps) => {
const { t } = useTranslation("../(website)/studio/main/PageBottomPane/Components");

  return (
    <div className="text-center mr-3">
      {snippetBeforeHasOnlyWhitespaces && (
        <Text>{t('please-provide-the-snippet-before-the-transformation-to-execute-the-codemod')}</Text>
      )}
      {codemodSourceHasOnlyWhitespaces && (
        <Text>{t('please-provide-the-codemod-to-execute-it')}</Text>
      )}
      {firstCodemodExecutionErrorEvent !== undefined ? (
        <Text>{t('codemod-has-execution-error-check-the')}<Button
            variant="link"
            className="text-md -ml-1 pt-3 font-light text-gray-500 dark:text-gray-300"
            onClick={onDebug}
          >{t('debugger')}</Button>{t('to-get-more-info')}</Text>
      ) : null}
    </div>
  );
};
