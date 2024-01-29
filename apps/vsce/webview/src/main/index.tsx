import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../shared/index.css';
import '../shared/util.css';
import 'tippy.js/dist/tippy.css';
import './App.css';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement,
);

root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
