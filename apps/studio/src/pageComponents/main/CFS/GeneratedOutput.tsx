// eslint-disable-next-line import/extensions
import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api.d.ts';
import dynamic from 'next/dynamic';
import { useMemo, useRef, type MouseEventHandler } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import ButtonWithOnClickTextChange from '~/components/button/ButtonWithOnClickTextChange';
import Collapsable from '~/components/Collapsable';
import Panel from '~/components/Panel';
import Text from '~/components/Text';
import { selectCFSOutput, setIsOpen } from '~/store/slices/CFS';
import { selectMod, setContent } from '~/store/slices/mod';
import { selectFirstTreeNode } from '~/store/slices/snippets';
import { selectActiveSnippet } from '~/store/slices/view';
import { buildFactoryCode } from '~/utils/buildFactoryCode';
import { injectCFSOutputToCodemod } from '~/utils/injectCFSOutputToCodemod';
import prettifyDeprecated from '~/utils/prettify';

const CodeSnippet = dynamic(() => import('~/components/Snippet'), {
	loading: () => <p>Loading...</p>,
	ssr: false,
});

const GeneratedOutput = () => {
	const activeSnippet = useSelector(selectActiveSnippet);
	const selectedBeforeInputNode = useSelector(
		selectFirstTreeNode('before', activeSnippet),
	);
	const selectedAfterInputNode = useSelector(
		selectFirstTreeNode('after', activeSnippet),
	);
	const generatedOutput = useSelector(
		selectCFSOutput(selectedBeforeInputNode),
	);
	const codemod = useSelector(selectMod);
	const dispatch = useDispatch();

	const ref = useRef<monaco.editor.IStandaloneCodeEditor>(null);

	const handleCopyGeneratedOutput = () => {
		const text = ref.current?.getValue();
		if (!text) {
			throw new Error('No text to copy');
		}
		navigator.clipboard.writeText(text);
	};

	const AfterSnippetAddedGeneratedOutput = useMemo(() => {
		if (selectedAfterInputNode !== null) {
			const factoryCode = buildFactoryCode(
				selectedAfterInputNode.actualNode,
			);
			if (factoryCode && generatedOutput) {
				return prettifyDeprecated(
					generatedOutput.concat(`.replaceWith(${factoryCode})`),
				);
			}
		}
		return prettifyDeprecated(generatedOutput);
	}, [generatedOutput, selectedAfterInputNode]);

	const insertGeneratedOutputToCodemod = () => {
		if (codemod.internalContent) {
			const newContent = injectCFSOutputToCodemod(
				codemod.internalContent,
				AfterSnippetAddedGeneratedOutput,
			);
			if (!newContent) {
				throw new Error('No content to inject');
			}
			dispatch(setContent(newContent));
			dispatch(setIsOpen(false));
		}
	};

	const onInsert: MouseEventHandler<HTMLButtonElement> = (e) => {
		e.stopPropagation();
		insertGeneratedOutputToCodemod();
		toast.success('Inserted "Find and Replace" statement into the codemod');
	};

	return (
		<Panel className="flex w-full flex-col overflow-y-auto">
			<div className="relative grow  rounded bg-gray-lighter dark:bg-gray-dark  ">
				<div className="rounded bg-gray-bg dark:bg-gray-light ">
					<Collapsable
						className="h-full"
						contentWrapperClassName="h-full"
						defaultCollapsed={false}
						rightContent={
							<div className="flex items-center ">
								<ButtonWithOnClickTextChange
									className="z-10  relative mr-6 "
									clickedText="Inserted!"
									color="gray"
									disabled={false}
									onClick={onInsert}
									size="sm"
									textChangeDuration={4000}
									variant="solid"
								>
									Insert
								</ButtonWithOnClickTextChange>
								<ButtonWithOnClickTextChange
									className="z-10  relative mr-6 "
									clickedText="Copied!"
									color="gray"
									disabled={false}
									onClick={(e) => {
										e.stopPropagation();
										handleCopyGeneratedOutput();
									}}
									size="sm"
									textChangeDuration={4000}
									variant="solid"
								>
									Copy
								</ButtonWithOnClickTextChange>
							</div>
						}
						title={
							<Text
								className="mb-3"
								fontWeight="semibold"
								isTitle
							>
								Generated Find
								{selectedAfterInputNode !== null
									? ' & Replace '
									: ' '}
								Statement
							</Text>
						}
					>
						<div className="h-[20vh]">
							<CodeSnippet
								options={{
									folding: false,
									lineNumbers: 'off',
									readOnly: true,
									renderLineHighlight: 'none',
								}}
								highlights={[]}
								language="typescript"
								path="generatedOutput.ts"
								ref={ref}
								value={AfterSnippetAddedGeneratedOutput}
							/>
						</div>
					</Collapsable>
				</div>
			</div>
		</Panel>
	);
};

export default GeneratedOutput;
