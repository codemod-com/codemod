import { useSelector } from "react-redux";
import { selectLog } from "~/store/slices/log";

export const useFirstCodemodExecutionErrorEvent = () => {
	const { events } = useSelector(selectLog);

	const firstCodemodExecutionErrorEvent = events.find(
		(e) => e.kind === "codemodExecutionError",
	);

	return firstCodemodExecutionErrorEvent ?? null;
};
