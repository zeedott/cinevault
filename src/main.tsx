// Ensure window.fetch is assignable in sandboxed iframe environments
try {
  let _fetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    get: () => _fetch,
    set: (v) => {
      _fetch = v;
    },
    configurable: true,
    enumerable: true,
  });
} catch {
  // Ignore if fetch redefinition is prohibited
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
// @ts-ignore: missing type declarations for CSS import
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
