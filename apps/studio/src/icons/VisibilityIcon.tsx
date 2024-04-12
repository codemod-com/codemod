import { Chevrons } from "~/icons/Chevrons";
import type { VisibilityOptions } from "~/types/options";
import { alwaysVisible } from "~/utils/visibility";

export const VisibilityIcon = ({
	visibilityOptions = alwaysVisible,
	className,
}: { visibilityOptions?: VisibilityOptions; className?: string }) => (
	<span
		onClick={visibilityOptions.toggleVisibility}
		className="panel_show_hide_icon"
	>
		{
			<Chevrons
				className={className}
				direction={visibilityOptions.isVisible ? "right" : "left"}
			/>
		}
	</span>
);
