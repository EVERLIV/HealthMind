import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Service Worker Registration - only in supported environments
if ('serviceWorker' in navigator && 
    'PushManager' in window && 
    !window.location.hostname.includes('stackblitz') &&
    !window.location.hostname.includes('webcontainer')) {
  
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[SW] Service Worker registered successfully:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[SW] New content is available; please refresh.');
              } else {
                console.log('[SW] Content is cached for offline use.');
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
    }
  });
} else {
  console.log('[SW] Service Worker not supported in this environment');
}

createRoot(document.getElementById("root")!).render(<App />);