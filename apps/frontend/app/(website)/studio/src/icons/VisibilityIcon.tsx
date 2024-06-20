import { Chevrons } from "@studio/icons/Chevrons";
import type { VisibilityOptions } from "@studio/types/options";
import { alwaysVisible } from "@studio/utils/visibility";

export const VisibilityIcon = ({
	                               visibilityOptions = alwaysVisible,
	                               className,
                               }: { visibilityOptions?: VisibilityOptions; className?: string }) => (
	<span
		onClick={ visibilityOptions.toggleVisibility }
		className="panel_show_hide_icon"
	>
    {
	    <Chevrons
		    className={ className }
		    direction={ visibilityOptions.isVisible ? "right" : "left" }
	    />
    }
  </span>
);
