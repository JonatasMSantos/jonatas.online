import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon, GithubIcon, Globe02Icon, Linkedin01Icon, Mail01Icon } from '@hugeicons/core-free-icons';
import { LINKS } from '@/data/content';
import { useLang } from '@/lib/i18n';

export default function ContactApp() {
  const { t } = useLang();
  const rows = [
    { href: LINKS.email, icon: Mail01Icon, label: t.contact.email, value: LINKS.emailLabel },
    { href: LINKS.linkedin, icon: Linkedin01Icon, label: 'LinkedIn', value: 'in/jonatas-m-santos' },
    { href: LINKS.github, icon: GithubIcon, label: 'GitHub', value: 'JonatasMSantos' },
    { href: LINKS.contact, icon: Globe02Icon, label: t.contact.extra, value: 'contato.jonatas.online' },
  ];

  return (
    <div className="contact">
      <h3>{t.contact.title}</h3>
      <p className="muted">{t.contact.sub}</p>
      <ul className="contact-list">
        {rows.map(row => (
          <li key={row.href}>
            <a href={row.href} target={row.href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
              <HugeiconsIcon icon={row.icon} size={20} strokeWidth={1.7} />
              <span className="contact-text">
                <span className="contact-label">{row.label}</span>
                <span className="muted small">{row.value}</span>
              </span>
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} strokeWidth={2} className="contact-arrow" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
