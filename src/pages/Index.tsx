import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const CHAT_URL = 'https://functions.poehali.dev/797ebf69-8625-472a-ad13-1fc9808907d4';

const ICON_BASE =
  'https://raw.githubusercontent.com/LehaSex/rust-game-icons/main/large';

const FLOATING_ITEMS = [
  { icon: `${ICON_BASE}/weapons/rifle.ak.png`, top: '11%', left: '7%', size: 'w-24', delay: '0s', r: '-15deg' },
  { icon: `${ICON_BASE}/tools/axe.salvaged.png`, top: '20%', left: '84%', size: 'w-20', delay: '1.2s', r: '20deg' },
  { icon: `${ICON_BASE}/weapons/pistol.revolver.png`, top: '67%', left: '5%', size: 'w-20', delay: '0.6s', r: '-8deg' },
  { icon: `${ICON_BASE}/explosives/explosive.timed.png`, top: '76%', left: '81%', size: 'w-24', delay: '2s', r: '12deg' },
  { icon: `${ICON_BASE}/tools/pickaxe.png`, top: '39%', left: '90%', size: 'w-16', delay: '1.8s', r: '-25deg' },
  { icon: `${ICON_BASE}/resources/wood.png`, top: '84%', left: '39%', size: 'w-16', delay: '0.3s', r: '10deg' },
  { icon: `${ICON_BASE}/resources/metal.fragments.png`, top: '14%', left: '54%', size: 'w-14', delay: '2.4s', r: '0deg' },
  { icon: `${ICON_BASE}/weapons/bow.hunting.png`, top: '54%', left: '77%', size: 'w-20', delay: '1s', r: '-18deg' },
  { icon: `${ICON_BASE}/resources/stones.png`, top: '31%', left: '14%', size: 'w-16', delay: '1.5s', r: '6deg' },
  { icon: `${ICON_BASE}/resources/sulfur.png`, top: '61%', left: '47%', size: 'w-14', delay: '0.9s', r: '0deg' },
  { icon: `${ICON_BASE}/medical/bandage.png`, top: '9%', left: '29%', size: 'w-12', delay: '2.7s', r: '-12deg' },
  { icon: `${ICON_BASE}/weapons/rifle.bolt.png`, top: '47%', left: '3%', size: 'w-24', delay: '0.4s', r: '22deg' },
];

type Msg = { role: 'user' | 'assistant'; content: string };

const HELI_TEXTURE = 'https://rustlabs.com/img/items180/scraptransportheli.png';

const HelicopterAvatar = ({ className = '' }: { className?: string }) => (
  <img
    src={HELI_TEXTURE}
    alt="Стрекоза — транспортный вертолёт из Rust"
    draggable={false}
    className={`${className} object-contain [filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.5))]`}
  />
);

const Index = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const startChat = () => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await res.json();
      const reply = data.reply || 'Не удалось получить ответ. Попробуй ещё раз.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Ошибка связи с сервером. Попробуй ещё раз.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden bg-[#e8e3dc] font-body text-neutral-900">
      {/* ЭКРАН 1 — ПРИВЕТСТВИЕ */}
      <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Красно-белый градиентный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#cd412b] via-[#e8e3dc] to-[#b8321f]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.5),transparent_60%)]" />

        {/* Индустриальная сетка */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.6) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Сканирующая линия */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-0 h-32 w-full animate-scan bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </div>

        {/* Плавающие текстуры предметов из Rust */}
        {FLOATING_ITEMS.map((item, i) => (
          <div
            key={i}
            className="pointer-events-none absolute animate-float select-none"
            style={
              {
                top: item.top,
                left: item.left,
                animationDelay: item.delay,
                '--r': item.r,
              } as React.CSSProperties
            }
          >
            <img
              src={item.icon}
              alt=""
              draggable={false}
              className={`${item.size} opacity-90 [filter:sepia(0.35)_saturate(1.25)_contrast(1.05)_drop-shadow(0_8px_12px_rgba(0,0,0,0.45))]`}
            />
          </div>
        ))}

        {/* Контент */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Аватарка — Стрекоза (боевой вертолёт) */}
          <div
            className="mb-8 flex h-28 w-28 animate-fade-up items-center justify-center rounded-2xl border-2 border-neutral-900/80 bg-neutral-900 shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
            style={{ opacity: 0 }}
          >
            <HelicopterAvatar className="h-20 w-20" />
          </div>

          <h1
            className="animate-fade-up font-display text-7xl font-bold uppercase leading-none tracking-tight text-neutral-900 sm:text-8xl md:text-9xl"
            style={{ opacity: 0, animationDelay: '0.15s' }}
          >
            Rusty
            <span className="ml-3 inline-block animate-flicker text-white [text-shadow:_3px_3px_0_#0d0d0d,_-1px_-1px_0_#0d0d0d]">
              AI
            </span>
          </h1>

          <p
            className="mt-6 max-w-md animate-fade-up font-body text-lg font-medium text-neutral-800 sm:text-xl"
            style={{ opacity: 0, animationDelay: '0.3s' }}
          >
            Твой личный помощник по игре{' '}
            <span className="font-bold text-[#8a1c0c]">Rust</span>. Спроси о крафте,
            рейдах, оружии и выживании — отвечу на всё.
          </p>

          <button
            onClick={startChat}
            className="group mt-12 flex animate-fade-up items-center gap-3 rounded-md border-2 border-neutral-900 bg-[#cd412b] px-10 py-5 font-display text-xl font-semibold uppercase tracking-widest text-white shadow-[0_6px_0_#0d0d0d] transition-all duration-200 ease-out hover:scale-125 hover:bg-white hover:text-neutral-900 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] active:translate-y-1 active:shadow-[0_2px_0_#0d0d0d]"
            style={{ opacity: 0, animationDelay: '0.5s' }}
          >
            <Icon name="MessageSquare" size={24} className="transition-transform group-hover:rotate-12" />
            Начать чат
          </button>
        </div>

        <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 font-body text-xs uppercase tracking-[0.3em] text-neutral-700/60">
          Powered by Mistral AI
        </div>
      </section>

      {/* ЭКРАН 2 — ЧАТ */}
      <section
        ref={chatRef}
        className="relative flex h-screen w-full flex-col bg-neutral-900 text-neutral-100"
      >
        {/* Шапка чата */}
        <header className="flex items-center gap-3 border-b border-white/10 bg-[#1a1a1a] px-5 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#cd412b]">
            <HelicopterAvatar className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <div className="font-display text-xl font-bold uppercase tracking-wide">
              Rusty <span className="text-[#cd412b]">AI</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-green-500" /> На связи
            </div>
          </div>
          <button
            onClick={backToTop}
            className="flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/10"
          >
            <Icon name="ArrowUp" size={16} /> Наверх
          </button>
        </header>

        {/* Лента сообщений */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.length === 0 && (
              <div className="mt-10 text-center text-neutral-400">
                <div className="mb-4 flex justify-center">
                  <HelicopterAvatar className="h-16 w-16 opacity-60" />
                </div>
                <p className="font-medium">Задай любой вопрос по игре Rust</p>
                <p className="mt-1 text-sm">
                  Например: «Сколько C4 нужно на металлическую дверь?»
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-[#cd412b] text-white'
                      : 'rounded-bl-sm border border-white/10 bg-[#242424] text-neutral-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-[#242424] px-4 py-4">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0.3s]" />
                </div>
              </div>
            )}
            <div ref={scrollBottomRef} />
          </div>
        </div>

        {/* Поле ввода */}
        <div className="border-t border-white/10 bg-[#1a1a1a] px-4 py-4">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Спроси о Rust..."
              className="max-h-32 flex-1 resize-none rounded-xl border border-white/15 bg-[#242424] px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-[#cd412b] focus:outline-none"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#cd412b] text-white transition-all hover:bg-[#e04e35] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="Send" size={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;