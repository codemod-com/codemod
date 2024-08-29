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
  onAddInsight: (args: any) => void;
  onOpenChange: (open: boolean) => void;
};

const AddNewInsightDialog = ({ onAddInsight, onOpenChange, open }: Props) => {
  const [name, setName] = useState("");

  const handleButtonClick = async () => {
    onAddInsight({ name });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="bg-primary-dark dark:bg-primary-light p-s max-w-[360px] max-h-[520px] !rounded-[16px] !flex !flex-col gap-s">
          <DialogTitle className="flex gap-xs items-center font-bold">
            <Folder size={20} />
            Add new insight
          </DialogTitle>
          <Input
            onChange={(e) => {
              setName(e.target.value);
            }}
            placeholder="Insight name"
            onClear={() => {
              setName("");
            }}
            value={name}
            inputClassName="placeholder:text-secondary-light dark:placeholder:text-secondary-dark"
            iconClassName="text-secondary-light dark:text-secondary-dark w-5 h-5"
            commandClassName="max-h-[20px] !font-medium !body-s-medium"
            className="bg-white dark:bg-black !rounded-[6px] !p-xxs"
          />
          <div className="flex justify-end">
            <Button
              disabled={name.trim() === ""}
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

export default AddNewInsightDialog;
