import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error("Critical render error:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: white;">Critical Error: ${error instanceof Error ? error.message : String(error)}</div>`;
  }
} else {
  console.error("Root element not found");
}
