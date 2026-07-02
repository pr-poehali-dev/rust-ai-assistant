import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const CHAT_URL = 'https://functions.poehali.dev/797ebf69-8625-472a-ad13-1fc9808907d4';

const HELI_TEXTURE =
  'https://cdn.poehali.dev/projects/3f8e31f4-6296-4e66-9830-ddd8d82519bb/files/1297769f-e0ac-416f-95fe-d6908a840df5.jpg';

type Msg = { role: 'user' | 'assistant'; content: string };

const HelicopterAvatar = ({ className = '' }: { className?: string }) => (
  <img
    src={HELI_TEXTURE}
    alt="Rusty AI"
    draggable={false}
    className={`${className} object-cover`}
  />
);

const QUICK_PROMPTS = [
  { icon: 'Bomb', title: 'Рейд', text: 'Сколько нужно C4 и сатчелей, чтобы зарейдить металлическую дверь?' },
  { icon: 'FlaskConical', title: 'Крафт', text: 'Как скрафтить порох и взрывчатку? Дай точный рецепт.' },
  { icon: 'Crosshair', title: 'Оружие', text: 'Какое оружие лучше для PvP на средней и дальней дистанции?' },
  { icon: 'Castle', title: 'База', text: 'Как построить надёжную базу для новичка, которую сложно зарейдить?' },
];

const TOPICS = [
  { icon: 'Swords', label: 'Оружие и PvP' },
  { icon: 'FlaskConical', label: 'Крафты и рецепты' },
  { icon: 'Bomb', label: 'Рейды и взрывчатка' },
  { icon: 'Castle', label: 'Строительство баз' },
  { icon: 'Map', label: 'Монументы и лут' },
  { icon: 'Leaf', label: 'Фермы и выживание' },
];

const Index = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;
    const newMessages: Msg[] = [...messages, { role: 'user', content: clean }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: clean, history: messages }),
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

  const newChat = () => {
    setMessages([]);
    setInput('');
    setSidebarOpen(false);
  };

  const hasChat = messages.length > 0;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#0c0b0a] font-body text-neutral-100">
      {/* Живой фон: тёплое зарево + сетка */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(205,65,43,0.22),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(140,40,25,0.18),transparent_45%)]" />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed z-40 flex h-full w-72 flex-col border-r border-white/10 bg-[#141210]/95 backdrop-blur-xl transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 pb-4 pt-6">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[#cd412b]/50 shadow-[0_0_20px_rgba(205,65,43,0.4)]">
            <HelicopterAvatar className="h-full w-full" />
          </div>
          <div>
            <div className="font-display text-xl font-bold uppercase leading-none tracking-wide">
              Rusty <span className="text-[#cd412b]">AI</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Онлайн
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={newChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#cd412b] px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white shadow-[0_4px_20px_rgba(205,65,43,0.4)] transition-all hover:bg-[#e04e35] hover:shadow-[0_6px_28px_rgba(205,65,43,0.55)]"
          >
            <Icon name="Plus" size={18} /> Новый чат
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <div className="px-2 py-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-600">
            Темы
          </div>
          {TOPICS.map((t, i) => (
            <button
              key={i}
              className="mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Icon name={t.icon} size={17} className="shrink-0 text-[#cd412b]" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-white/10 px-5 py-4 text-[11px] text-neutral-600">
          Rusty AI · помощник по игре Rust
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== ОСНОВНАЯ ОБЛАСТЬ ===== */}
      <main className="relative z-10 flex h-full flex-1 flex-col">
        {/* Топбар */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 backdrop-blur-sm md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-neutral-300 md:hidden"
          >
            <Icon name="Menu" size={22} />
          </button>
          <div className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-wide md:hidden">
            Rusty <span className="text-[#cd412b]">AI</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-neutral-400 md:flex">
            <Icon name="Sparkles" size={16} className="text-[#cd412b]" />
            Эксперт по выживанию, рейдам и крафту в Rust
          </div>
          {hasChat && (
            <button
              onClick={newChat}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-white/10"
            >
              <Icon name="RotateCcw" size={14} /> Сбросить
            </button>
          )}
        </div>

        {/* Лента / приветствие */}
        <div className="flex-1 overflow-y-auto">
          {!hasChat ? (
            <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
              <div className="relative mb-7">
                <div className="absolute -inset-6 animate-pulse rounded-full bg-[#cd412b]/25 blur-3xl" />
                <div className="relative h-28 w-28 overflow-hidden rounded-3xl border-2 border-[#cd412b]/60 shadow-[0_0_50px_rgba(205,65,43,0.45)]">
                  <HelicopterAvatar className="h-full w-full" />
                </div>
              </div>

              <h1 className="animate-fade-up font-display text-5xl font-bold uppercase tracking-tight sm:text-6xl">
                Rusty <span className="text-[#cd412b]">AI</span>
              </h1>
              <p className="mt-4 max-w-lg animate-fade-up font-body text-base leading-relaxed text-neutral-400">
                Личный эксперт по игре Rust. Спрашивай про крафты, рейды, оружие,
                базы и выживание — отвечу конкретными цифрами и советами.
              </p>

              <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.text)}
                    className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:-translate-y-1 hover:border-[#cd412b]/60 hover:bg-white/[0.06] hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#cd412b]/15 text-[#cd412b] transition-colors group-hover:bg-[#cd412b] group-hover:text-white">
                      <Icon name={p.icon} size={22} />
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold uppercase tracking-wide text-neutral-100">
                        {p.title}
                      </div>
                      <div className="mt-1 text-xs leading-relaxed text-neutral-400">
                        {p.text}
                      </div>
                    </div>
                    <Icon
                      name="ArrowUpRight"
                      size={16}
                      className="absolute right-3 top-3 text-neutral-600 transition-colors group-hover:text-[#cd412b]"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                      m.role === 'user'
                        ? 'bg-neutral-700'
                        : 'border border-[#cd412b]/50 shadow-[0_0_14px_rgba(205,65,43,0.4)]'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <Icon name="User" size={18} className="text-neutral-200" />
                    ) : (
                      <HelicopterAvatar className="h-full w-full" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                      m.role === 'user'
                        ? 'rounded-tr-md bg-[#cd412b] text-white'
                        : 'rounded-tl-md border border-white/10 bg-white/[0.04] text-neutral-100'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#cd412b]/50">
                    <HelicopterAvatar className="h-full w-full" />
                  </div>
                  <div className="flex gap-1.5 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-4">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#cd412b] [animation-delay:0s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#cd412b] [animation-delay:0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#cd412b] [animation-delay:0.3s]" />
                  </div>
                </div>
              )}
              <div ref={scrollBottomRef} />
            </div>
          )}
        </div>

        {/* ===== ПОЛЕ ВВОДА ===== */}
        <div className="px-4 pb-5 pt-2 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-[#171412]/90 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-colors focus-within:border-[#cd412b]/70">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                rows={1}
                placeholder="Спроси Rusty AI о чём угодно в Rust..."
                className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#cd412b] text-white transition-all hover:bg-[#e04e35] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Icon name="ArrowUp" size={18} />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-neutral-600">
              Rusty AI может ошибаться — проверяй важные цифры по рейдам на своём сервере.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
