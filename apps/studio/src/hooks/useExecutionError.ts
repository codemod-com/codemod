import { useSelector } from "react-redux";
import { selectLog } from "~/store/slices/log";

export const useExecutionError = () => {
	const { events } = useSelector(selectLog);
	return events.find((e) => e.kind === "codemodExecutionError") || null;
};
