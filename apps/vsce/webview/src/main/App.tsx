import { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { MainWebviewViewProps } from '../../../src/selectors/selectMainWebviewViewProps';
import CodemodEngineNodeNotFound from '../CodemodEngineNodeNotFound';
import { App as CodemodList } from '../codemodList/App';
import { useTheme } from '../shared/Snippet/useTheme';
import type { WebviewMessage } from '../shared/types';

let toastContainerProps = {
	pauseOnHover: false,
	pauseOnFocusLoss: false,
	hideProgressBar: false,
	closeOnClick: false,
	closeButton: false,
	draggable: false,
	autoClose: false as const,
	enableMultiContainer: true,
};

declare global {
	interface Window {
		mainWebviewViewProps: MainWebviewViewProps;
	}
}

function App() {
	let ref = useRef(null);
	let theme = useTheme();
	let [screenWidth, setScreenWidth] = useState<number | null>(null);
	let [mainWebviewViewProps, setMainWebviewViewProps] = useState(
		window.mainWebviewViewProps,
	);

	useEffect(() => {
		let handler = (event: MessageEvent<WebviewMessage>) => {
			if (event.data.kind !== 'webview.main.setProps') {
				return;
			}

			setMainWebviewViewProps(event.data.props);
		};

		window.addEventListener('message', handler);

		return () => {
			window.removeEventListener('message', handler);
		};
	}, []);

	useEffect(() => {
		if (ResizeObserver === undefined) {
			return undefined;
		}

		if (ref.current === null) {
			return;
		}

		let resizeObserver = new ResizeObserver((entries) => {
			let container = entries[0] ?? null;
			if (container === null) {
				return;
			}
			let {
				contentRect: { width },
			} = container;

			setScreenWidth(width);
		});

		resizeObserver.observe(ref.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	if (mainWebviewViewProps === null) {
		return (
			<main className="App" ref={ref}>
				<p className="warning">
					Open a workspace folder to use the Codemod VSCode Extension.
				</p>
			</main>
		);
	}

	if (!mainWebviewViewProps.codemodEngineNodeLocated) {
		return <CodemodEngineNodeNotFound />;
	}

	return (
		<main className="App" ref={ref}>
			{mainWebviewViewProps.activeTabId === 'codemods' ? (
				<CodemodList
					screenWidth={screenWidth}
					{...mainWebviewViewProps}
				/>
			) : null}
			<ToastContainer
				{...toastContainerProps}
				containerId="codemodListToastContainer"
				position="bottom-right"
				theme={theme === 'vs-light' ? 'light' : 'dark'}
			/>
			<ToastContainer
				{...toastContainerProps}
				containerId="primarySidebarToastContainer"
				theme={theme === 'vs-light' ? 'light' : 'dark'}
				position="top-right"
			/>
		</main>
	);
}

export default App;
