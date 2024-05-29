import ReactDom from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
console.log(createRoot);

import Component from 'Component';

hydrateRoot(document.getElementById('app'), <Component />);
