import { createRoot } from 'react-dom/client';

import { setBaseUrl } from './api/custom-fetch';
import App from './App';

import './index.css';

setBaseUrl(import.meta.env.VITE_API_BASE_URL || '');

createRoot(document.getElementById('root')!).render(<App/>);
