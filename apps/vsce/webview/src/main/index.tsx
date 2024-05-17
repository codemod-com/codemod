import React from 'react';
import ReactDOM from 'react-dom/client';
import 'tippy.js/dist/tippy.css';
import '../shared/index.css';
import '../shared/util.css';
import App from './App';
import './App.css';

let root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
