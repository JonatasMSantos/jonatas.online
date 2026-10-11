import { HugeiconsIcon } from '@hugeicons/react';

// Ícone no formato squircle do macOS: gradiente e glifo branco.
// Sem `size`, ocupa o espaço do pai (a Dock encolhe os itens em telas estreitas).
export default function AppIcon({ icon, from, to, size }) {
  return (
    <span
      className="app-icon"
      style={{
        '--icon-size': size ? `${size}px` : '100%',
        background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      <HugeiconsIcon icon={icon} size="52%" strokeWidth={1.7} color="#fff" />
    </span>
  );
}
