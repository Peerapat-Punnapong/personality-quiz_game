import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { installSoundHooks } from './lib/sound';
installSoundHooks();
createRoot(document.getElementById('root')!).render(<App />);
