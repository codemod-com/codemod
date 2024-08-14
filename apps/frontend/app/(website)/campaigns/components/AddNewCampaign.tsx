// @TODO move to shared or global
import Input from "@/components/shared/Input";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@studio/components/ui/dialog";

import Button from "@/components/shared/Button";
import { Folder } from "lucide-react";
import { useState } from "react";

export type Props = {
  open: boolean;
  onAddCampaign: (args: any) => void;
  onOpenChange: (open: boolean) => void;
};

const AddNewCampaignDialog = ({ onAddCampaign, onOpenChange, open }: Props) => {
  const [campaignName, setCampaignName] = useState("");

  const handleButtonClick = async () => {
    onAddCampaign({ name: campaignName });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="bg-primary-dark dark:bg-primary-light p-s max-w-[360px] max-h-[520px] !rounded-[16px] !flex !flex-col gap-s">
          <DialogTitle className="flex gap-xs items-center font-bold">
            <Folder size={20} />
            Add new campaign
          </DialogTitle>
          <Input
            onChange={(e) => {
              setCampaignName(e.target.value);
            }}
            placeholder="Campaign name"
            onClear={() => {
              setCampaignName("");
            }}
            value={campaignName}
            inputClassName="placeholder:text-secondary-light dark:placeholder:text-secondary-dark"
            iconClassName="text-secondary-light dark:text-secondary-dark w-5 h-5"
            commandClassName="max-h-[20px] !font-medium !body-s-medium"
            className="bg-white dark:bg-black !rounded-[6px] !p-xxs"
          />
          <div className="flex justify-end">
            <Button
              disabled={campaignName.trim() === ""}
              intent="primary"
              onClick={handleButtonClick}
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default AddNewCampaignDialog;
