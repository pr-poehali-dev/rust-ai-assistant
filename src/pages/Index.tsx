import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const CHAT_URL = 'https://functions.poehali.dev/797ebf69-8625-472a-ad13-1fc9808907d4';

const HELI_TEXTURE =
  'https://cdn.poehali.dev/projects/3f8e31f4-6296-4e66-9830-ddd8d82519bb/files/1297769f-e0ac-416f-95fe-d6908a840df5.jpg';

type Msg = { role: 'user' | 'assistant'; content: string };

const HelicopterAvatar = ({ className = '' }: { className?: string }) => (
  <img
    src={HELI_TEXTURE}
    alt="Стрекоза — транспортный вертолёт из Rust"
    draggable={false}
    className={`${className} rounded-lg object-cover`}
  />
);

const QUICK_PROMPTS = [
  { icon: 'Bomb', title: 'Рейд базы', text: 'Сколько нужно C4 и сатчелей, чтобы зарейдить металлическую дверь?' },
  { icon: 'Crosshair', title: 'Лучшее оружие', text: 'Какое оружие лучше всего для PvP на средней дистанции?' },
  { icon: 'Hammer', title: 'Крафт', text: 'Как скрафтить порох и что для этого нужно?' },
  { icon: 'Home', title: 'Постройка базы', text: 'Как построить надёжную базу для новичка, которую сложно зарейдить?' },
];

const HISTORY_ITEMS = [
  'Рейд металлической двери',
  'Крафт пороха и патронов',
  'Лучший лут на монументах',
  'Как приручить лошадь',
];

const Index = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="flex h-screen w-full overflow-hidden bg-[#0f0e0d] font-body text-neutral-100">
      {/* Текстура/шум фона */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(205,65,43,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(205,65,43,0.4) 1px,transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed z-40 flex h-full w-72 flex-col border-r border-white/10 bg-[#161413] transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Логотип */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#cd412b]/50 bg-[#cd412b]/20">
            <HelicopterAvatar className="h-full w-full" />
          </div>
          <div className="font-display text-xl font-bold uppercase tracking-wide">
            Rusty <span className="text-[#cd412b]">AI</span>
          </div>
        </div>

        {/* Новый чат */}
        <div className="p-4">
          <button
            onClick={newChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#cd412b] bg-[#cd412b] px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#e04e35]"
          >
            <Icon name="Plus" size={18} /> Новый чат
          </button>
        </div>

        {/* История */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="px-2 py-2 text-xs uppercase tracking-widest text-neutral-500">
            Недавние
          </div>
          {HISTORY_ITEMS.map((h, i) => (
            <button
              key={i}
              className="flex w-full items-center gap-2.5 truncate rounded-lg px-3 py-2.5 text-left text-sm text-neutral-300 transition-colors hover:bg-white/5"
            >
              <Icon name="MessageSquare" size={16} className="shrink-0 text-neutral-500" />
              <span className="truncate">{h}</span>
            </button>
          ))}
        </div>

        {/* Низ сайдбара */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Powered by Mistral AI
          </div>
        </div>
      </aside>

      {/* Затемнение для мобилки */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== ОСНОВНАЯ ОБЛАСТЬ ===== */}
      <main className="relative z-10 flex h-full flex-1 flex-col">
        {/* Топбар (мобилка) */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-neutral-300">
            <Icon name="Menu" size={22} />
          </button>
          <div className="font-display text-lg font-bold uppercase">
            Rusty <span className="text-[#cd412b]">AI</span>
          </div>
        </div>

        {/* Лента / приветствие */}
        <div className="flex-1 overflow-y-auto">
          {!hasChat ? (
            /* ПРИВЕТСТВЕННЫЙ ЭКРАН (стиль ChatGPT/Gemini) */
            <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-6 py-10 text-center">
              <div className="relative mb-6">
                <div className="absolute -inset-4 animate-pulse rounded-full bg-[#cd412b]/20 blur-2xl" />
                <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-[#cd412b]/60 bg-[#1a1a1a] shadow-[0_0_40px_rgba(205,65,43,0.35)]">
                  <HelicopterAvatar className="h-full w-full" />
                </div>
              </div>

              <h1 className="animate-fade-up font-display text-5xl font-bold uppercase tracking-tight sm:text-6xl">
                Rusty <span className="text-[#cd412b]">AI</span>
              </h1>
              <p className="mt-4 max-w-md animate-fade-up font-body text-base text-neutral-400">
                Твой личный эксперт по игре Rust. Спроси о крафте, рейдах, оружии,
                базах и выживании — отвечу конкретно и по делу.
              </p>

              {/* Карточки быстрых вопросов */}
              <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.text)}
                    className="group flex items-start gap-3 rounded-xl border border-white/10 bg-[#161413] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#cd412b]/60 hover:bg-[#1d1a18]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#cd412b]/15 text-[#cd412b] transition-colors group-hover:bg-[#cd412b] group-hover:text-white">
                      <Icon name={p.icon} size={20} />
                    </div>
                    <div>
                      <div className="font-display text-sm font-semibold uppercase tracking-wide text-neutral-100">
                        {p.title}
                      </div>
                      <div className="mt-1 text-xs leading-relaxed text-neutral-400">
                        {p.text}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ЛЕНТА СООБЩЕНИЙ */
            <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ${
                      m.role === 'user'
                        ? 'bg-neutral-700'
                        : 'border border-[#cd412b]/50 bg-[#cd412b]/20'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <Icon name="User" size={18} className="text-neutral-200" />
                    ) : (
                      <HelicopterAvatar className="h-full w-full" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'rounded-tr-sm bg-[#cd412b] text-white'
                        : 'rounded-tl-sm border border-white/10 bg-[#161413] text-neutral-100'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#cd412b]/50 bg-[#cd412b]/20">
                    <HelicopterAvatar className="h-full w-full" />
                  </div>
                  <div className="flex gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-[#161413] px-4 py-4">
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
        <div className="border-t border-white/10 bg-[#0f0e0d] px-4 py-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-[#161413] p-2 focus-within:border-[#cd412b]/70">
              <textarea
                ref={textareaRef}
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
                <Icon name="Send" size={18} />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-neutral-600">
              Rusty AI может ошибаться. Проверяй важные цифры по рейдам на своём сервере.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
