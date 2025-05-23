import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Add logging for React initialization
console.log('Initializing React application...');

try {
  const rootElement = document.getElementById('root');
  console.log('Root element:', rootElement);

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  console.log('Root created successfully');

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Failed to initialize React application:', error);
  document.body.innerHTML = `
    <div style="color: red; padding: 20px;">
      <h1>Error Initializing Application</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
