import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const useDebounceSelector = <T extends (...args: any) => any>(
	selector: T,
	time = 250,
) => {
	const [data, setState] = useState<unknown>();
	const result = useRef<ReturnType<T>>();
	const refTimeout = useRef<ReturnType<typeof setTimeout>>();

	if (refTimeout.current) {
		clearTimeout(refTimeout.current);
	}

	const selectorData = useSelector(selector);

	useEffect(
		() => () => refTimeout.current && clearTimeout(refTimeout.current),
		[],
	);

	if (time === 0) {
		return selectorData;
	}

	refTimeout.current = setTimeout(() => {
		if (result.current !== selectorData) {
			setState(selectorData);
		}
	}, time);

	return data;
};

export default useDebounceSelector;
