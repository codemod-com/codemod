import { createRoot } from 'react-dom/client';
import { render } from 'react-dom';

let fn = () => {
	if (true) {
		let root = createRoot(theNode);
		root.render(<Component />);
	}
};
