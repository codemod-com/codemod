// eslint-disable-next-line import/extensions
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api.d.ts";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
import { useAppDispatch } from "~/store";
import { setRangeThunk } from "~/store/setRangeThunk";
import { useSelectActiveEvent } from "~/store/zustand/log";
import { selectMod, setContent } from "../../store/slices/mod";
import { prettify } from "../../utils/prettify";

const CodeSnippet = dynamic(() => import("~/components/Snippet"), {
	loading: () => <p>Loading...</p>,
	ssr: false,
});

const Codemod = () => {
	const editor = useRef<monaco.editor.IStandaloneCodeEditor>(null);
	const { internalContent, ranges } = useSelector(selectMod);
	const dispatch = useAppDispatch();
	const activeEvent = useSelectActiveEvent();

	const content = internalContent ?? "";

	const onBlur = useCallback(() => {
		const prettified = prettify(content);
		if (prettified !== content) {
			dispatch(setContent(prettified));
		}
	}, [content, dispatch]);

	const onKeyUp = useCallback(
		(event: monaco.IKeyboardEvent) => {
			if (event.code === "Escape") {
				return;
			}

			dispatch(
				setRangeThunk({
					target: "CODEMOD_INPUT",
					ranges: [],
				}),
			);
		},
		[dispatch],
	);

	const handleSelectionChange = useCallback(
		(range: OffsetRange) => {
			dispatch(
				setRangeThunk({
					target: "CODEMOD_INPUT",
					ranges: [range],
				}),
			);
		},
		[dispatch],
	);

	useEffect(() => {
		if (activeEvent === null || editor.current === null) {
			return;
		}

		const model = editor.current.getModel();

		if (model === null) {
			return;
		}

		const startPosition = model.getPositionAt(
			activeEvent.codemodSourceRange.start,
		);

		editor.current.revealPositionInCenter(startPosition);
	}, [dispatch, activeEvent]);

	return (
		<CodeSnippet
			ref={editor}
			highlights={ranges}
			language="typescript"
			onBlur={onBlur}
			onChange={(value) => dispatch(setContent(value ?? ""))}
			onKeyUp={({ event }) => onKeyUp(event)}
			path="codemod.ts"
			value={content}
			onSelectionChange={handleSelectionChange}
		/>
	);
};

export default Codemod;
