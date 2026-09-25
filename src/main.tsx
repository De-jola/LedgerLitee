import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    return Promise.all(registrations.map((registration) => registration.unregister()));
  });
}
if ('caches' in window) {
  void caches.keys().then((keys) => {
    return Promise.all(keys.filter((key) => key.toLowerCase().includes('workbox') || key.toLowerCase().includes('ledgerlite')).map((key) => caches.delete(key)));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
