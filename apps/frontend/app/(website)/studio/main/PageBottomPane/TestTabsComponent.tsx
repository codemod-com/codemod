import { cn } from "@/utils";
import { MagicWand } from "@phosphor-icons/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tabs from "@radix-ui/react-tabs";
import Tooltip from "@studio/components/Tooltip/Tooltip";
import { useSnippetsStore } from "@studio/store/snippets";
import { useCodemodAi } from "../../features/modgpt/hooks/codemod-ai";
import { useChatStore } from "../../features/modgpt/store/chat-state";

export const TestTabsComponent = () => {
  const {
    getSelectedEditors,
    getAllSnippets,
    addPair,
    removePair,
    selectedPairIndex,
    setSelectedPairIndex,
    editors,
    // renameEditor,
    getHasReachedTabsLimit,
  } = useSnippetsStore();

  const { messages, appendMessage } = useChatStore();
  const { before, after } = getAllSnippets();

  const { send: initiateTestGeneration, isLoading } = useCodemodAi({
    input: {
      type: "generate_test",
      before,
      after,
      context: "",
      description: "",
    },
    onFinish: () =>
      appendMessage({
        role: "assistant",
        content: "Test case created and added to a new test tab",
      }),
  });

  // const [editingIndex, setEditingIndex] = useState(null);
  // const [newName, setNewName] = useState("");
  // const tabsRef = useRef(null);
  // const inputRef = useRef(null);
  // const [isEditedNameAlreadyInUse, setIsEditedNameAlreadyInUse] =
  //   useState(false);
  // const { activateModGpt } = useViewStore();

  // useEffect(() => {
  //   if (inputRef.current) {
  //     setTimeout(() => inputRef.current.focus(), 0);
  //   }
  // }, [editingIndex]);

  // const handleRename = (index) => {
  //   setEditingIndex(index);
  //   setNewName(editors[index].name);
  // };

  // const handleBlur = (index) => {
  //   if (
  //     newName.trim() === "" ||
  //     editors.some((editor, i) => editor.name === newName && i !== index)
  //   ) {
  //     handleRename(index);
  //   } else {
  //     renameEditor(index)(newName);
  //   }
  //   setEditingIndex(null);
  //   setIsEditedNameAlreadyInUse(false);
  // };

  // const onChange = (e) => {
  //   const value = e.target.value;
  //   setIsEditedNameAlreadyInUse(
  //     editors.some((editor) => editor.name === value),
  //   );
  //   setNewName(value);
  // };

  // const handleKeyPress = (e, index) => {
  //   if (e.key === "Enter") {
  //     handleBlur(index);
  //   }
  // };

  return (
    <Tabs.Root defaultValue="0" className="tabs">
      <Tabs.List className="tabs-list overflow-x-auto" ref={tabsRef}>
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
                <button type="button" className="dots-button">
                  ⋮
                </button>
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
        {!getHasReachedTabsLimit() && (
          <>
            <button
              type="bu"
              className="add-tab-button"
              onClick={() => addPair()}
            >
              +
            </button>
            <Tooltip
              trigger={
                <button
                  type="submit"
                  onClick={() => {}}
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
                  Generate a new pair of before/after based on your existing
                  code examples OR based on the natural language description.
                </p>
              }
            />
          </>
        )}
      </Tabs.List>
    </Tabs.Root>
  );
};
