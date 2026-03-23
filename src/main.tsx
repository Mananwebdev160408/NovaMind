import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initSDK } from './runanywhere';
import './styles/index.css';

// NOTE: StrictMode removed intentionally.
// It double-invokes effects in dev mode, which corrupts
// the shared WASM state in @runanywhere (LlamaCPP / ONNX backends)
// and triggers STATUS_STACK_BUFFER_OVERRUN.

// Initialize SDK then render
initSDK().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <App />,
);
