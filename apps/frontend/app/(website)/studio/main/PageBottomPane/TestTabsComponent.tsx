import { cn } from "@/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tabs from "@radix-ui/react-tabs";
import { useSnippetsStore } from "@studio/store/snippets";
import React, { useState, useRef, useEffect } from "react";

export const TestTabsComponent = () => {
  const {
    getSelectedEditors,
    addPair,
    removePair,
    selectedPairIndex,
    setSelectedPairIndex,
    editors,
    renameEditor,
  } = useSnippetsStore();

  const [editingIndex, setEditingIndex] = useState(null);
  const [newName, setNewName] = useState("");
  const tabsRef = useRef(null);
  const inputRef = useRef(null);
  const [isEditedNameAlreadyInUse, setIsEditedNameAlreadyInUse] =
    useState(false);
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 0);
    }
  }, [editingIndex]);

  const handleRename = (index) => {
    setEditingIndex(index);
    setNewName(editors[index].name);
  };

  const handleBlur = (index) => {
    if (
      newName.trim() === "" ||
      editors.some((editor, i) => editor.name === newName && i !== index)
    ) {
      handleRename(index);
    } else {
      renameEditor(index)(newName);
    }
    setEditingIndex(null);
    setIsEditedNameAlreadyInUse(false);
  };

  const onChange = (e) => {
    const value = e.target.value;
    setIsEditedNameAlreadyInUse(
      editors.some((editor) => editor.name === value),
    );
    setNewName(value);
  };

  const handleKeyPress = (e, index) => {
    if (e.key === "Enter") {
      handleBlur(index);
    }
  };

  return (
    <Tabs.Root defaultValue="0" className="tabs">
      <Tabs.List className="tabs-list" ref={tabsRef}>
        {editors.map((editor, i) => (
          <div
            key={editor.name}
            className={cn(
              isEditedNameAlreadyInUse && "input-error",
              "tab-item",
              selectedPairIndex === i && "active",
            )}
          >
            <Tabs.Trigger
              className={cn("tab-trigger")}
              onClick={() => setSelectedPairIndex(i)}
              onDoubleClick={() => handleRename(i)}
              value={String(i)}
            >
              {editingIndex === i ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  style={{ padding: "0", margin: 0 }}
                  onChange={onChange}
                  onBlur={() => handleBlur(i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                />
              ) : (
                editor.name
              )}
            </Tabs.Trigger>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="dots-button">⋮</button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="dropdown-menu-content">
                <DropdownMenu.Item
                  className="dropdown-menu-item"
                  onClick={() => removePair(i)}
                >
                  Remove Snippet
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        ))}
        <button className="add-tab-button" onClick={addPair}>
          +
        </button>
      </Tabs.List>
    </Tabs.Root>
  );
};
