import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import './styles/global.css';

if (typeof window !== 'undefined') {
  const rootElement = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  rootElement.classList.add('has-js');

  const applyMotionPreference = (matches: boolean) => {
    rootElement.dataset.prefersReducedMotion = matches ? 'true' : 'false';

    if (matches) {
      rootElement.classList.remove('has-animations');
    } else {
      rootElement.classList.add('has-animations');
    }
  };

  applyMotionPreference(motionQuery.matches);

  const onChange = (event: MediaQueryListEvent) => applyMotionPreference(event.matches);

  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', onChange);
  } else {
    motionQuery.addListener(onChange);
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
