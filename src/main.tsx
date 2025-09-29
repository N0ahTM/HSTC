import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';
import './styles/main.css';

async function configureAmplify() {
  const globalConfig = (globalThis as any).__AMPLIFY_CONFIG__;
  if (globalConfig) {
    Amplify.configure(globalConfig);
    return;
  }

  try {
    const response = await fetch('/amplify_outputs.json', { cache: 'no-cache' });
    if (response.ok) {
      const config = await response.json();
      Amplify.configure(config);
      return;
    }
    console.warn(`amplify_outputs.json not found (status ${response.status}).`);
  } catch (error) {
    console.warn('Amplify configuration fetch failed:', error);
  }

  Amplify.configure({});
}

async function bootstrap() {
  await configureAmplify();
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Missing #root element');
  }
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
