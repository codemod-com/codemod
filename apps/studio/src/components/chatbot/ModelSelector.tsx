import { useDispatch, useSelector } from "react-redux";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { useTheme } from "../../pageComponents/main/themeContext";
import {
	ENGINES,
	type Engine,
	selectEngine,
	setEngine,
} from "../../store/slices/CFS";

const EngineSelector = () => {
	const dispatch = useDispatch();
	const engine = useSelector(selectEngine);

	const handleEngineChange = (e: Engine) => {
		dispatch(setEngine(e));
	};

	const { isDark } = useTheme();
	return (
		<Select onValueChange={handleEngineChange} value={engine}>
			<SelectTrigger className="flex w-full select-none items-center font-semibold">
				<span
					className={cn("mr-[0.75rem] text-xs font-light text-slate-500", {
						"text-slate-200": isDark,
					})}
				>
					LLM:
				</span>
				<SelectValue placeholder={engine} />
			</SelectTrigger>
			<SelectContent>
				{ENGINES.map((e) => (
					<SelectItem
						key={e}
						value={e}
						className={cn({
							"font-semibold": engine === e,
						})}
					>
						{e}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default EngineSelector;
