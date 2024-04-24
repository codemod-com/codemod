import { PanelResizeHandle } from "react-resizable-panels";

const ResizeHandle = ({
  className = "",
  id,
  direction,
}: {
  className?: string;
  id?: string;
  direction: "vertical" | "horizontal";
}) => (
  <PanelResizeHandle
    className={`resizeHandleOuter resizeHandlerOuter-${direction}  ${className} `}
    id={id}
  >
    <div className={`resizeHandleInner-${direction}`} />
  </PanelResizeHandle>
);

export default ResizeHandle;
