import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { installSoundHooks } from './lib/sound';
import { inject } from '@vercel/analytics';
installSoundHooks();
inject(); // Vercel Web Analytics — counts visitors & page views
createRoot(document.getElementById('root')!).render(<App />);
