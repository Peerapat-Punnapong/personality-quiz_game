import { useEffect } from 'react';
import { useRoute, navigate } from './lib/router';
import { isGhostId } from './data/ghosts';
import { Veil } from './components/Veil';
import { SoundToggle } from './components/SoundToggle';
import { setMusicLevel } from './lib/sound';
import Home from './pages/Home';
import Lore from './pages/Lore';
import Intro from './pages/Intro';
import Ready from './pages/Ready';
import Quiz from './pages/Quiz';
import Reveal from './pages/Reveal';
import Result from './pages/Result';

export default function App() {
  const path = useRoute();
  const [, a, b] = path.split('/');
  let page; let known = true;
  if (a === 'lore') page = <Lore />;
  else if (a === 'intro') page = <Intro n={Math.min(Math.max(+b || 1, 1), 6)} />;
  else if (a === 'ready') page = <Ready />;
  else if (a === 'quiz' && +b >= 1 && +b <= 10) page = <Quiz n={+b} />;
  else if (a === 'reveal') page = <Reveal />;
  else if (a === 'result' && isGhostId(b)) page = <Result id={b} />;
  else { page = <Home />; known = a === '' || a === undefined; }
  useEffect(() => { if (!known) navigate('/', 'none', true); setMusicLevel(a === 'quiz' || a === 'intro' || a === 'ready' ? 'quiet' : 'normal'); }, [path]);
  return <><div className="page" key={a + (b || '')}>{page}</div>{a !== 'lore' && known && a !== '' && a !== undefined && <SoundToggle floating />}<Veil /></>;
}
