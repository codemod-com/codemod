import { Chevrons } from "~/icons/Chevrons";
import { VisibilityOptions } from "~/types/options";
import { alwaysVisible } from "~/utils/visibility";

export const VisibilityIcon = ({
	visibilityOptions = alwaysVisible,
	className,
}: { visibilityOptions?: VisibilityOptions; className?: string }) => (
	<span onClick={visibilityOptions.toggleVisibility}>
		{
			<Chevrons
				className={className}
				direction={visibilityOptions.isVisible ? "right" : "left"}
			/>
		}
	</span>
);
