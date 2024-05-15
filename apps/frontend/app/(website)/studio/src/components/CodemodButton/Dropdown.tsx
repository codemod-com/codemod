import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  ComboboxProvider,
} from "@ariakit/react";
import * as RadixSelect from "@radix-ui/react-select";
import { CheckIcon, ChevronUpDownIcon, SearchIcon } from "@studio/icons";
import { startTransition } from "react";

type DropdownSelectorProps = {
  selectedRepository;
  propName?: string;
  selectRepository;
  repoSelectorOpen;
  setRepoSelectorOpen;
  setRepoValueToFilterBy;
  repoMatches;
};

export const DropdownSelector = ({
  selectedRepository,
  propName,
  selectRepository,
  repoSelectorOpen,
  setRepoSelectorOpen,
  setRepoValueToFilterBy,
  repoMatches,
}: DropdownSelectorProps) => {
  return (
    <div className="flex justify-center items-center p-4 bg-white min-w-[400px] rounded-lg border-0">
      <RadixSelect.Root
        value={propName ? selectedRepository?.[propName] : selectedRepository}
        onValueChange={selectRepository}
        open={repoSelectorOpen}
        onOpenChange={setRepoSelectorOpen}
      >
        <ComboboxProvider
          open={repoSelectorOpen}
          setOpen={setRepoSelectorOpen}
          resetValueOnHide
          includesBaseElement={false}
          setValue={(value) => {
            startTransition(() => {
              setRepoValueToFilterBy(value);
            });
          }}
        >
          <RadixSelect.Trigger
            aria-label="Language"
            className="select flex items-center"
          >
            <RadixSelect.Value placeholder="Select a repository (required)" />
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
            <div className="combobox-wrapper">
              <div className="combobox-icon">
                <SearchIcon />
              </div>
              <Combobox
                autoSelect
                placeholder="Search repositories"
                className="combobox"
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
            <ComboboxList className="listbox">
              {repoMatches.map((item) => (
                <RadixSelect.Item
                  key={propName ? item[propName] : item}
                  value={propName ? item[propName] : item}
                  asChild
                  className="item"
                >
                  <ComboboxItem>
                    <RadixSelect.ItemText>
                      {propName ? item[propName] : item}
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
