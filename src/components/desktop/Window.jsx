import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/lib/i18n';

const MENU_H = 28;
const DOCK_ROOM = 96;

const clampPos = (pos, size) => ({
  x: Math.min(Math.max(pos.x, 8 - size.w + 120), window.innerWidth - 120),
  y: Math.min(Math.max(pos.y, MENU_H + 4), window.innerHeight - 60),
});

// Posição inicial: centro da área útil, com cascata pela ordem de abertura.
const initialPos = (size, cascade) => {
  const areaH = window.innerHeight - MENU_H - DOCK_ROOM;
  const offset = (cascade % 6) * 28;
  return clampPos(
    {
      x: Math.round((window.innerWidth - size.w) / 2 + offset),
      y: Math.round(MENU_H + Math.max(12, (areaH - size.h) / 2) + offset),
    },
    size
  );
};

const fitSize = wanted => ({
  w: Math.min(wanted.w, window.innerWidth - 32),
  h: Math.min(wanted.h, window.innerHeight - MENU_H - DOCK_ROOM - 16),
});

export default function Window({ app, title, z, focused, minimized, cascade, onClose, onMinimize, onFocus, children }) {
  const { t } = useLang();
  const size = fitSize(app.size);
  const [pos, setPos] = useState(() => initialPos(size, cascade));
  const [zoomed, setZoomed] = useState(false);
  const drag = useRef(null);

  useEffect(() => {
    const onResize = () => setPos(current => clampPos(current, fitSize(app.size)));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [app.size]);

  const onPointerDown = event => {
    if (event.button > 0 || zoomed || event.target.closest('button')) return;
    drag.current = { id: event.pointerId, dx: event.clientX - pos.x, dy: event.clientY - pos.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = event => {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    setPos(clampPos({ x: event.clientX - drag.current.dx, y: event.clientY - drag.current.dy }, size));
  };

  const onPointerUp = event => {
    if (drag.current?.id === event.pointerId) drag.current = null;
  };

  const style = zoomed
    ? { zIndex: z }
    : { zIndex: z, width: size.w, height: size.h, transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` };

  return (
    <section
      className="window"
      data-focused={focused ? '' : undefined}
      data-zoomed={zoomed ? '' : undefined}
      data-minimized={minimized ? '' : undefined}
      style={style}
      onPointerDownCapture={onFocus}
      aria-label={title}
      role="dialog"
    >
      <header
        className="window-bar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={event => !event.target.closest('button') && setZoomed(v => !v)}
      >
        <div className="window-lights">
          <button type="button" className="light light-close" aria-label={t.menu.close} onClick={onClose} />
          <button type="button" className="light light-min" aria-label={t.menu.minimize} onClick={onMinimize} />
          <button
            type="button"
            className="light light-zoom"
            aria-label={t.menu.zoom}
            onClick={() => setZoomed(v => !v)}
          />
        </div>
        <h2 className="window-title">{title}</h2>
      </header>
      <div className={`window-body ${app.bodyClass ?? ''}`}>{children}</div>
    </section>
  );
}
