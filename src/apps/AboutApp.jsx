import { useLang } from '@/lib/i18n';

export default function AboutApp() {
  const { t } = useLang();
  return (
    <div className="about">
      <header className="about-head">
        <img src="/img/jonatas-foto.webp" alt={t.name} className="about-photo" />
        <div>
          <h3>{t.name}</h3>
          <p className="eyebrow">{t.about.kicker}</p>
          <p className="muted small">{t.location}</p>
        </div>
      </header>
      <p className="about-sub">{t.about.sub}</p>
      {Object.entries(t.about.sections).map(([key, section]) => (
        <section key={key} className="about-section">
          <h4>{section.title}</h4>
          <p>{section.body}</p>
        </section>
      ))}
      <p className="about-line">{t.about.line}</p>
    </div>
  );
}
