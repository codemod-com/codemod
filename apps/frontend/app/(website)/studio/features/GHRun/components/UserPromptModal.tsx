import { useTranslation } from "react-i18next";
import Modal from "@studio/components/Modal";
import { Button } from "@studio/components/ui/button";

export type UserPromptModalProps = {
  onReject: () => void;
  onApprove: () => Promise<void>;
  isModalShown: boolean;
};

export const UserPromptModal = ({
  onReject,
  onApprove,
  isModalShown,
}: UserPromptModalProps) => {
const { t } = useTranslation("../(website)/studio/features/GHRun/components");

  return isModalShown ? (
    <Modal onClose={onReject} centered transparent={false} width="w-3/12">
      <h2 className="text-center text-xl p-2 font-bold">
        {
          "To use this feature, we need you to grant us the access to your Github repositories. Would you like to proceed?"
        }
      </h2>
      <div className="flex flex-row items-center justify-center w-100">
        <Button className="m-3 text-amber-50" onClick={onApprove}>{t('yes-fragment')}</Button>

        <Button
          className="m-3 text-amber-50"
          variant="destructive"
          onClick={onReject}
        >{t('no-fragment')}</Button>
      </div>
    </Modal>
  ) : null;
};
