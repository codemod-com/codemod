import type { HeaderProps } from "../utils/types";

import Pane from "@studio/components/Panel";
import { VisibilityIcon } from "@studio/icons/VisibilityIcon";

export let SnippetHeader = ({
  isCollapsed = false,
  ondblclick = console.log,
  title,
  visibilityOptions,
}: HeaderProps) => (
  <Pane.Header>
    {isCollapsed && (
      <Pane.HeaderTab ondblclick={ondblclick}>
        <Pane.HeaderTitle>{title}</Pane.HeaderTitle>
      </Pane.HeaderTab>
    )}
    <Pane.HeaderTab active={isCollapsed}>
      {visibilityOptions && (
        <VisibilityIcon visibilityOptions={visibilityOptions} />
      )}
      <Pane.HeaderTitle>{title}</Pane.HeaderTitle>
    </Pane.HeaderTab>
  </Pane.Header>
);
