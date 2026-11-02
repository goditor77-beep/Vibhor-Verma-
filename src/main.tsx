import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for complete offline capability on Android & PWA
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New JEE 2027 Command content available.');
  },
  onOfflineReady() {
    console.log('JEE 2027 Command App ready for complete offline use!');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

