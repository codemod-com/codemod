import { cn } from "@/utils";
import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  ComboboxProvider,
} from "@ariakit/react";
import * as RadixSelect from "@radix-ui/react-select";
import { useFilteredItems } from "@studio/components/CodemodButton/hooks/useFilter";
import { CheckIcon, ChevronUpDownIcon, SearchIcon } from "@studio/icons";
import type { ToVoid } from "@studio/types/transformations";
import { LoaderIcon } from "lucide-react";
import { startTransition, useState } from "react";

type DropdownSelectorProps<T> = {
  selectedValue?: T;
  propName: keyof T;
  onSelect?: ToVoid<string>;
  items: T[];
  placeholder: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
};

export let DropdownSelector = <T,>({
  selectedValue,
  propName,
  onSelect,
  items,
  placeholder,
  isDisabled = false,
  isLoading = false,
  loadingMessage = "Fetching",
}: DropdownSelectorProps<T>) => {
  let [repoSelectorOpen, setRepoSelectorOpen] = useState(false);
  let [valueToFilterBy, setValueToFilterBy] = useState<string>();

  let filteredElements = useFilteredItems(
    items,
    valueToFilterBy,
    selectedValue,
    propName,
  );

  if (isLoading)
    return (
      <div className="p-4 flex justify-center items-center">
        <LoaderIcon className="spinner mr-2" />
        {loadingMessage}
      </div>
    );

  return (
    <div
      className={cn(
        "flex justify-center items-center p-4 bg-white min-w-[400px] rounded-lg border-0",
        isDisabled && "invisible",
      )}
    >
      <RadixSelect.Root
        value={selectedValue?.[propName] as string}
        onValueChange={onSelect}
        open={repoSelectorOpen}
        onOpenChange={setRepoSelectorOpen}
        disabled={isDisabled}
      >
        <ComboboxProvider
          open={repoSelectorOpen}
          setOpen={setRepoSelectorOpen}
          resetValueOnHide
          includesBaseElement={false}
          setValue={(value) => {
            startTransition(() => {
              setValueToFilterBy(value);
            });
          }}
        >
          <RadixSelect.Trigger
            aria-label="Language"
            className={cn(
              "select flex w-full",
              repoSelectorOpen && "invisible",
            )}
          >
            <RadixSelect.Value placeholder={placeholder} />
            <RadixSelect.Icon className="select-icon ml-1">
              <ChevronUpDownIcon />
            </RadixSelect.Icon>
          </RadixSelect.Trigger>
          <RadixSelect.Content
            role="dialog"
            aria-label="Languages"
            position="popper"
            className="popover"
            sideOffset={4}
            alignOffset={-16}
          >
            <div className="combobox-wrapper w-full">
              <div className="combobox-icon">
                <SearchIcon />
              </div>
              <Combobox
                autoSelect
                placeholder="Search"
                className="combobox w-full"
                // Ariakit's Combobox manually triggers a blur event on virtually
                // blurred items, making them work as if they had actual DOM
                // focus. These blur events might happen after the corresponding
                // focus events in the capture phase, leading Radix Select to
                // close the popover. This happens because Radix Select relies on
                // the order of these captured events to discern if the focus was
                // outside the element. Since we don't have access to the
                // onInteractOutside prop in the Radix SelectContent component to
                // stop this behavior, we can turn off Ariakit's behavior here.
                onBlurCapture={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              />
            </div>
            <ComboboxList className="listbox w-full">
              {filteredElements.map((item, i) => (
                <RadixSelect.Item
                  key={item?.[propName] as string}
                  value={item?.[propName] as string}
                  asChild
                  className="item"
                >
                  <ComboboxItem>
                    <RadixSelect.ItemText>
                      {item?.[propName] as string}
                    </RadixSelect.ItemText>
                    <RadixSelect.ItemIndicator className="item-indicator">
                      <CheckIcon />
                    </RadixSelect.ItemIndicator>
                  </ComboboxItem>
                </RadixSelect.Item>
              ))}
            </ComboboxList>
          </RadixSelect.Content>
        </ComboboxProvider>
      </RadixSelect.Root>
    </div>
  );
};
