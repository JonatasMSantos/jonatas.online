import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n';

const useClock = lang => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  const day = now.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '');
  const time = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return `${day}  ${time}`;
};

export default function MenuBar({ activeTitle }) {
  const { lang, t, toggle } = useLang();
  const clock = useClock(lang);

  return (
    <nav className="menubar">
      <div className="menubar-left">
        <img src="/img/logo-hq-dark.svg" alt="" className="menubar-logo" />
        <strong className="menubar-app">{activeTitle ?? t.name}</strong>
        <span className="menubar-item menubar-hide-sm">jonatas.online</span>
      </div>
      <div className="menubar-right">
        <button type="button" className="menubar-item menubar-button" onClick={toggle} aria-label={t.menu.language}>
          {lang === 'pt' ? 'PT' : 'EN'}
        </button>
        <span className="menubar-item">{clock}</span>
      </div>
    </nav>
  );
}
