import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary';

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <StrictMode>
    <App />
  </StrictMode>
    </ErrorBoundary>,
);
