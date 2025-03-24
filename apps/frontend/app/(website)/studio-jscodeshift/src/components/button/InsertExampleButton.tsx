import Tooltip from "@studio/components/Tooltip/Tooltip";
import { Button } from "@studio/components/ui/button";
import { ExampleIcon } from "@studio/icons/Example";
import {
  AFTER_SNIPPET_DEFAULT_CODE,
  BEFORE_SNIPPET_DEFAULT_CODE,
} from "@studio/store/initialState";
import { buildDefaultCodemodSource, useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "../../store/snippets";

const InsertExampleButton = () => {
  const { engine, getSelectedEditors, clearAll } = useSnippetsStore();
  const { setContent } = useModStore();
  return (
    <Tooltip
      trigger={
        <Button
          className="flex items-center justify-center px-0"
          onClick={async () => {
            await clearAll();
            getSelectedEditors().setBeforeSnippet(BEFORE_SNIPPET_DEFAULT_CODE);
            getSelectedEditors().setAfterSnippet(AFTER_SNIPPET_DEFAULT_CODE);
            setContent(buildDefaultCodemodSource(engine));
          }}
          size="xs"
          variant="ghost"
        >
          <ExampleIcon />
          <span className="sr-only">Insert Example</span>
        </Button>
      }
      content={<p className="font-normal">Insert an example</p>}
    />
  );
};

export default InsertExampleButton;
