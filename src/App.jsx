import { lazy, Suspense, useCallback, useMemo, useReducer } from 'react';
import ClickSpark from '@/components/ClickSpark';
import Dock from '@/components/Dock';
import Folder from '@/components/Folder';
import AppIcon from '@/components/desktop/AppIcon';
import MenuBar from '@/components/desktop/MenuBar';
import Window from '@/components/desktop/Window';
import { APPS, DESKTOP_ORDER, DOCK_ORDER, EXTERNAL } from '@/apps/registry';
import { PROJECTS } from '@/data/content';
import { DesktopContext } from '@/lib/desktop';
import { LangProvider, useLang } from '@/lib/i18n';

const DOCK_SIZE = 50;

// three.js fica fora do bundle inicial: o desktop aparece e o crachá cai logo depois.
const Badge = lazy(() => import('@/components/desktop/Badge'));

// Gerenciador de janelas: ordem de empilhamento, minimizar e cascata.
const reducer = (state, action) => {
  const z = state.top + 1;
  switch (action.type) {
    case 'open': {
      const existing = state.windows.find(w => w.id === action.id);
      if (existing) {
        return {
          top: z,
          opened: state.opened,
          windows: state.windows.map(w => (w.id === action.id ? { ...w, z, minimized: false } : w)),
        };
      }
      return {
        top: z,
        opened: state.opened + 1,
        windows: [...state.windows, { id: action.id, z, minimized: false, cascade: state.opened }],
      };
    }
    case 'focus':
      if (state.windows.find(w => w.id === action.id)?.z === state.top) return state;
      return { ...state, top: z, windows: state.windows.map(w => (w.id === action.id ? { ...w, z } : w)) };
    case 'minimize':
      return { ...state, windows: state.windows.map(w => (w.id === action.id ? { ...w, minimized: true } : w)) };
    case 'close':
      return { ...state, windows: state.windows.filter(w => w.id !== action.id) };
    default:
      return state;
  }
};

function Desktop() {
  const { t } = useLang();
  const [state, dispatch] = useReducer(reducer, { top: 10, opened: 0, windows: [] });
  const open = useCallback(id => dispatch({ type: 'open', id }), []);
  const desktop = useMemo(() => ({ open }), [open]);

  const visible = state.windows.filter(w => !w.minimized);
  const focused = visible.reduce((best, w) => (!best || w.z > best.z ? w : best), null);

  const dockItems = [
    ...DOCK_ORDER.map(id => ({
      label: t.apps[id],
      icon: <AppIcon icon={APPS[id].icon} from={APPS[id].colors[0]} to={APPS[id].colors[1]} />,
      active: state.windows.some(w => w.id === id),
      onClick: () => open(id),
    })),
    { separator: true },
    ...Object.entries(EXTERNAL).map(([id, link]) => ({
      label: t.apps[id],
      icon: <AppIcon icon={link.icon} from={link.colors[0]} to={link.colors[1]} />,
      onClick: () => window.open(link.href, '_blank', 'noopener'),
    })),
  ];

  return (
    <DesktopContext.Provider value={desktop}>
      <div className="desktop">
        <div className="wallpaper">
          <ClickSpark sparkColor="#ffffff" sparkCount={10} sparkRadius={22}>
            <div className="wallpaper-fill" />
          </ClickSpark>
        </div>

        <Suspense fallback={null}>
          <Badge />
        </Suspense>

        <ul className="desktop-icons">
          {DESKTOP_ORDER.map(id => (
            <li key={id}>
              <div
                className="desktop-icon"
                role="button"
                tabIndex={0}
                onClick={() => open(id)}
                onKeyDown={event => (event.key === 'Enter' || event.key === ' ') && open(id)}
              >
                {id === 'projects' ? (
                  <span className="desktop-folder">
                    <Folder
                      items={PROJECTS.map(project => ({ title: project.name, image: project.image }))}
                      size={0.32}
                      color="#4aa3ff"
                      openOn="hover"
                      zoomOnClick={false}
                      draggable={false}
                      theme="light"
                    />
                  </span>
                ) : (
                  <AppIcon icon={APPS[id].icon} from={APPS[id].colors[0]} to={APPS[id].colors[1]} size={60} />
                )}
                <span className="desktop-label">{t.apps[id]}</span>
              </div>
            </li>
          ))}
        </ul>

        <p className="desktop-hint">{t.hint}</p>

        <div className="windows">
          {state.windows.map(w => {
            const app = APPS[w.id];
            const Content = app.component;
            return (
              <Window
                key={w.id}
                app={app}
                title={t.apps[w.id]}
                z={w.z}
                cascade={w.cascade}
                minimized={w.minimized}
                focused={focused?.id === w.id}
                onFocus={() => dispatch({ type: 'focus', id: w.id })}
                onClose={() => dispatch({ type: 'close', id: w.id })}
                onMinimize={() => dispatch({ type: 'minimize', id: w.id })}
              >
                <Suspense fallback={<div className="window-loading" />}>
                  <Content />
                </Suspense>
              </Window>
            );
          })}
        </div>

        <MenuBar activeTitle={focused ? t.apps[focused.id] : null} />
        <div className="dock-layer">
          <Dock items={dockItems} theme="light" baseItemSize={DOCK_SIZE} magnification={74} tiles={false} />
        </div>
      </div>
    </DesktopContext.Provider>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Desktop />
    </LangProvider>
  );
}
