import React from 'react';

import New5PaneSetup from "./main/5PaneSetup";

import { createRoot } from 'react-dom/client';

window.process = {env: {}}
const container = document.getElementById('app');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<New5PaneSetup/>);