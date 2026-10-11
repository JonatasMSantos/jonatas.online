import { useEffect, useRef, useState } from 'react';
import TextType from '@/components/TextType';
import { complete, run } from '@/apps/terminal/commands';
import { useDesktop } from '@/lib/desktop';
import { useLang } from '@/lib/i18n';

const PROMPT = 'jonatas@macbook ~ %';
const INTRO = 'help';
const SPEED = 90;
const DELAY = 500;

function Output({ lines }) {
  return lines.map((line, index) => {
    switch (line.t) {
      case 'heading':
        return (
          <p key={index} className="terminal-role">
            {line.v}
          </p>
        );
      case 'dim':
        return (
          <p key={index} className="terminal-date">
            {line.v}
          </p>
        );
      case 'link':
        return (
          <p key={index}>
            <a href={line.href} target="_blank" rel="noreferrer" className="terminal-link">
              {line.v}
            </a>
          </p>
        );
      case 'row':
        return (
          <p key={index} className="terminal-row">
            <span className="terminal-key">{line.k}</span>
            {line.href ? (
              <a
                href={line.href}
                target={line.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noreferrer"
                className="terminal-link"
              >
                {line.v}
              </a>
            ) : (
              <span>{line.v}</span>
            )}
          </p>
        );
      case 'blank':
        return <p key={index} className="terminal-blank" />;
      default:
        return <p key={index}>{line.v}</p>;
    }
  });
}

export default function TerminalApp() {
  const ctx = useLang();
  const { open } = useDesktop();
  const [entries, setEntries] = useState([]);
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState('');
  const history = useRef([]);
  const cursor = useRef(-1);
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const nextId = useRef(0);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const execute = input => {
    const { out, effect } = run(input, ctxRef.current);
    if (effect?.type === 'clear') {
      setEntries([]);
      return;
    }
    const id = nextId.current++;
    setEntries(list => [...list, { id, cmd: input, out }]);
    if (effect?.type === 'open') open(effect.app);
    if (effect?.type === 'lang') ctxRef.current.setLang(effect.lang);
  };

  // Abertura: o TextType digita "help" sozinho e o terminal responde. O TextType
  // não avisa o fim com loop=false, então o tempo é calculado.
  useEffect(() => {
    const id = setTimeout(
      () => {
        execute(INTRO);
        setReady(true);
      },
      DELAY + INTRO.length * SPEED + 300
    );
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Rola o contêiner até o fim (o padding de baixo deixa o prompt acima da Dock no celular).
    const scroller = endRef.current?.closest('.window-body');
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
    if (ready) inputRef.current?.focus({ preventScroll: true });
  }, [entries, ready]);

  const onKeyDown = event => {
    if (event.key === 'Enter') {
      const input = value;
      setValue('');
      cursor.current = -1;
      if (input.trim()) history.current.unshift(input);
      execute(input);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      setValue(current => complete(current, ctxRef.current));
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const step = event.key === 'ArrowUp' ? 1 : -1;
      const next = Math.max(-1, Math.min(history.current.length - 1, cursor.current + step));
      cursor.current = next;
      setValue(next === -1 ? '' : history.current[next]);
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      setEntries([]);
    }
  };

  // Clicar em qualquer lugar foca o campo, sem atrapalhar quem seleciona texto.
  const onClick = () => {
    if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="terminal" onClick={onClick}>
      <p className="terminal-date">{ctx.t.terminal.welcome}</p>
      {!ready && (
        <p className="terminal-line">
          <span className="terminal-prompt">{PROMPT}</span>{' '}
          <TextType as="span" text={INTRO} typingSpeed={SPEED} initialDelay={DELAY} loop={false} cursorCharacter="▋" />
        </p>
      )}
      {entries.map(entry => (
        <div key={entry.id} className="terminal-entry">
          <p className="terminal-line">
            <span className="terminal-prompt">{PROMPT}</span> {entry.cmd}
          </p>
          <Output lines={entry.out} />
        </div>
      ))}
      {ready && (
        <label className="terminal-line terminal-input-row">
          <span className="terminal-prompt">{PROMPT}</span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={value}
            onChange={event => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label="Terminal"
          />
        </label>
      )}
      <div ref={endRef} />
    </div>
  );
}
