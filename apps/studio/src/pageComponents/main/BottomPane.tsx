import { Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PanelGroup, type ImperativePanelHandle } from 'react-resizable-panels';
import Pane from '~/components/Panel';
import ResizeHandle from '~/components/ResizePanel/ResizeHandler';
import { Button } from '~/components/ui/button';
import snippets, {
	addSnippet,
	selectEngine,
	selectSnippetNames,
} from '~/store/slices/snippets';
import { selectASTViewCollapsed, viewSlice } from '~/store/slices/view';
import { debounce } from '~/utils/debounce';
import ASTViewer from './ASTViewer';
import CodemodOutputHeader from './CodemodOutputHeader';
import LiveCodemodResult from './JSCodeshiftRender';
import Layout from './Layout';
import SnippetUI from './SnippetUI';

enum Panel {
	BEFORE_AST,
	BEFORE_SNIPPET,
	BEFORE_SECTION,
	AFTER_AST,
	AFTER_SNIPPET,
	AFTER_SECTION,
	OUTPUT_AST,
	OUTPUT_SNIPPET,
	AST_SECTION,
	SNIPPETS_SECTION,
}

const isServer = typeof window === 'undefined';

const PageBottomPane = () => {
	const engine = useSelector(selectEngine);
	const astViewCollapsed = useSelector(selectASTViewCollapsed);

	const snippetNames = useSelector(selectSnippetNames);

	const dispatch = useDispatch();
	const panelRefs = useRef<Record<string, ImperativePanelHandle | null>>({});

	const togglePanel = () => {
		dispatch(viewSlice.actions.setASTViewCollapsed(!astViewCollapsed));
	};

	const updateActiveSnippet = (name: string) => {
		dispatch(viewSlice.actions.setActiveSnippet(name));
	};

	const addNewTab = () => {
		dispatch(addSnippet({}));
	};

	useEffect(() => {
		const panel = panelRefs.current[Panel.AST_SECTION];

		if (panel === null || panel === undefined) {
			return undefined;
		}

		if (astViewCollapsed) {
			const timeout = setTimeout(() => {
				panel.collapse();
			}, 1);
			return () => {
				clearTimeout(timeout);
			};
		}

		panel.resize(25);
		return undefined;
	}, [astViewCollapsed]);

	return (
		<Layout.ResizablePanel
			collapsible
			defaultSize={50}
			minSize={0}
			style={{
				flexBasis: isServer ? '50%' : '0',
			}}
		>
			<PanelGroup direction="vertical">
				<Button
					className="flex cursor-pointer items-center justify-center rounded-none px-2 py-1"
					onClick={togglePanel}
					variant="ghost"
				>
					AST
				</Button>

				<Layout.ResizablePanel
					className="relative bg-gray-bg dark:bg-gray-light"
					collapsible
					defaultSize={50}
					minSize={0}
					ref={(ref) => {
						panelRefs.current[Panel.AST_SECTION] = ref;
					}}
					style={{
						maxHeight: isServer ? 0 : 'unset',
					}}
				>
					<PanelGroup direction="horizontal">
						<Layout.ResizablePanel
							className="relative bg-gray-bg dark:bg-gray-light"
							collapsible
							defaultSize={33}
							minSize={0}
							ref={(ref) => {
								panelRefs.current[Panel.BEFORE_AST] = ref;
							}}
							onResize={debounce((size) => {
								const panel =
									panelRefs.current[Panel.BEFORE_SNIPPET];

								if (panel === null || panel === undefined) {
									return;
								}

								panel.resize(size);
							}, 5)}
						>
							{engine === 'jscodeshift' ? (
								<>
									<ASTViewer type="before" />
								</>
							) : (
								'The AST View is not yet supported for tsmorph'
							)}
						</Layout.ResizablePanel>

						<ResizeHandle direction="horizontal" />

						<Layout.ResizablePanel
							className="relative bg-gray-bg dark:bg-gray-light"
							collapsible
							defaultSize={33}
							minSize={0}
							ref={(ref) => {
								panelRefs.current[Panel.AFTER_AST] = ref;
							}}
						>
							{engine === 'jscodeshift' ? (
								<>
									<ASTViewer type="after" />
								</>
							) : (
								'The AST View is not yet supported for tsmorph'
							)}
						</Layout.ResizablePanel>

						<ResizeHandle direction="horizontal" />

						<Layout.ResizablePanel
							className="relative bg-gray-bg dark:bg-gray-light"
							collapsible
							defaultSize={33}
							minSize={0}
							ref={(ref) => {
								panelRefs.current[Panel.OUTPUT_AST] = ref;
							}}
						>
							{engine === 'jscodeshift' ? (
								<>
									<ASTViewer type="output" />
								</>
							) : (
								'The AST View is not yet supported for tsmorph'
							)}
						</Layout.ResizablePanel>
					</PanelGroup>
				</Layout.ResizablePanel>

				<ResizeHandle direction="vertical" />

				<Layout.ResizablePanel
					className="relative bg-gray-bg dark:bg-gray-light"
					collapsible
					defaultSize={50}
					minSize={20}
					ref={(ref) => {
						panelRefs.current[Panel.SNIPPETS_SECTION] = ref;
					}}
				>
					<div
						role="tablist"
						className="flex gap-3 w-full bg-slate-200 p-2"
					>
						{snippetNames.map((name) => (
							<Button
								key={name}
								variant="outline"
								onClick={() => updateActiveSnippet(name)}
							>
								{name}
							</Button>
						))}
						<Button variant="outline" onClick={() => addNewTab()}>
							Add Snippet <Plus />
						</Button>
					</div>
					<PanelGroup direction="horizontal">
						<Layout.ResizablePanel
							className="relative bg-gray-bg dark:bg-gray-light"
							collapsible
							defaultSize={33}
							minSize={0}
							ref={(ref) => {
								panelRefs.current[Panel.BEFORE_SNIPPET] = ref;
							}}
							onResize={debounce((size) => {
								const panel =
									panelRefs.current[Panel.BEFORE_AST];

								if (panel === null || panel === undefined) {
									return;
								}

								panel.resize(size);
							}, 5)}
						>
							<SnippetHeader
								title="Before"
								// @TODO
								ondblclick={console.log}
								isCollapsed={false}
							/>
							<SnippetUI type="before" />
						</Layout.ResizablePanel>

						<ResizeHandle direction="horizontal" />

						{/* After & Codemod Output */}

						<Layout.ResizablePanel
							className="relative bg-gray-bg dark:bg-gray-light"
							collapsible
							defaultSize={66}
							minSize={0}
							ref={(ref) => {
								panelRefs.current[Panel.AFTER_SNIPPET] = ref;
							}}
						>
							<div className="grid grid-cols-2 gap-1">
								<SnippetHeader
									title="After (expected)"
									// @TODO
									ondblclick={console.log}
									isCollapsed={false}
								/>
								<CodemodOutputHeader />
							</div>
							<LiveCodemodResult />
						</Layout.ResizablePanel>
					</PanelGroup>
				</Layout.ResizablePanel>
			</PanelGroup>
		</Layout.ResizablePanel>
	);
};

// @TODO move to separate component
type HeaderProps = {
	isCollapsed: boolean;
	ondblclick: any;
	title: string;
};

const SnippetHeader = ({ isCollapsed, ondblclick, title }: HeaderProps) => (
	<Pane.Header>
		{isCollapsed && (
			<Pane.HeaderTab ondblclick={ondblclick}>
				<Pane.HeaderTitle>{title}</Pane.HeaderTitle>
			</Pane.HeaderTab>
		)}
		<Pane.HeaderTab active={isCollapsed}>
			<Pane.HeaderTitle>{title}</Pane.HeaderTitle>
		</Pane.HeaderTab>
	</Pane.Header>
);

export default PageBottomPane;
