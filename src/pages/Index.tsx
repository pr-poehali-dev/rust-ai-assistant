import { useState } from 'react';
import Icon from '@/components/ui/icon';

const FLOATING_ITEMS = [
  { emoji: '🔫', top: '12%', left: '8%', size: 'text-6xl', delay: '0s', r: '-15deg' },
  { emoji: '🪓', top: '22%', left: '85%', size: 'text-5xl', delay: '1.2s', r: '20deg' },
  { emoji: '🛡️', top: '68%', left: '6%', size: 'text-5xl', delay: '0.6s', r: '-8deg' },
  { emoji: '💣', top: '78%', left: '82%', size: 'text-6xl', delay: '2s', r: '12deg' },
  { emoji: '⛏️', top: '40%', left: '92%', size: 'text-4xl', delay: '1.8s', r: '-25deg' },
  { emoji: '🪵', top: '85%', left: '40%', size: 'text-4xl', delay: '0.3s', r: '10deg' },
  { emoji: '🔩', top: '15%', left: '55%', size: 'text-3xl', delay: '2.4s', r: '0deg' },
  { emoji: '🏹', top: '55%', left: '78%', size: 'text-5xl', delay: '1s', r: '-18deg' },
  { emoji: '🧱', top: '32%', left: '15%', size: 'text-4xl', delay: '1.5s', r: '6deg' },
  { emoji: '⚙️', top: '62%', left: '48%', size: 'text-3xl', delay: '0.9s', r: '0deg' },
  { emoji: '🥫', top: '10%', left: '30%', size: 'text-3xl', delay: '2.7s', r: '-12deg' },
  { emoji: '🔦', top: '48%', left: '4%', size: 'text-4xl', delay: '0.4s', r: '22deg' },
];

const Index = () => {
  const [entered, setEntered] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#e8e3dc] font-body text-neutral-900">
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

      {/* Плавающие предметы из Rust */}
      {FLOATING_ITEMS.map((item, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute animate-float select-none ${item.size} drop-shadow-lg`}
          style={
            {
              top: item.top,
              left: item.left,
              animationDelay: item.delay,
              '--r': item.r,
            } as React.CSSProperties
          }
        >
          {item.emoji}
        </div>
      ))}

      {/* Центральный контент */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Аватарка — штурмовая винтовка */}
        <div
          className="mb-8 flex h-28 w-28 animate-fade-up items-center justify-center rounded-2xl border-2 border-neutral-900/80 bg-neutral-900 shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
          style={{ opacity: 0 }}
        >
          <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none">
            <rect x="4" y="26" width="44" height="8" rx="1" fill="#cd412b" />
            <rect x="46" y="24" width="14" height="4" rx="1" fill="#e8e3dc" />
            <rect x="10" y="34" width="8" height="12" rx="1" fill="#e8e3dc" />
            <rect x="24" y="34" width="6" height="16" rx="1" fill="#cd412b" />
            <rect x="2" y="22" width="6" height="14" rx="1" fill="#e8e3dc" />
            <rect x="30" y="20" width="4" height="8" rx="1" fill="#e8e3dc" />
            <circle cx="38" cy="30" r="2" fill="#0d0d0d" />
          </svg>
        </div>

        {/* Название */}
        <h1
          className="animate-fade-up font-display text-7xl font-bold uppercase leading-none tracking-tight text-neutral-900 sm:text-8xl md:text-9xl"
          style={{ opacity: 0, animationDelay: '0.15s' }}
        >
          Rusty
          <span className="ml-3 inline-block animate-flicker text-white [text-shadow:_3px_3px_0_#0d0d0d,_-1px_-1px_0_#0d0d0d]">
            AI
          </span>
        </h1>

        {/* Подзаголовок */}
        <p
          className="mt-6 max-w-md animate-fade-up font-body text-lg font-medium text-neutral-800 sm:text-xl"
          style={{ opacity: 0, animationDelay: '0.3s' }}
        >
          Твой личный помощник по игре{' '}
          <span className="font-bold text-[#8a1c0c]">Rust</span>. Спроси о крафте,
          рейдах, оружии и выживании — отвечу на всё.
        </p>

        {/* Кнопка «Начать чат» */}
        <button
          onClick={() => setEntered(true)}
          className="group mt-12 flex animate-fade-up items-center gap-3 rounded-md border-2 border-neutral-900 bg-[#cd412b] px-10 py-5 font-display text-xl font-semibold uppercase tracking-widest text-white shadow-[0_6px_0_#0d0d0d] transition-all duration-200 ease-out hover:scale-125 hover:bg-white hover:text-neutral-900 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] active:translate-y-1 active:shadow-[0_2px_0_#0d0d0d]"
          style={{ opacity: 0, animationDelay: '0.5s' }}
        >
          <Icon
            name="MessageSquare"
            size={24}
            className="transition-transform group-hover:rotate-12"
          />
          Начать чат
        </button>

        {entered && (
          <div className="mt-8 animate-fade-in rounded-md border border-neutral-900/20 bg-white/70 px-6 py-3 font-body text-sm text-neutral-700 backdrop-blur">
            Чат скоро откроется — напиши мне, что должно происходить после нажатия 🚀
          </div>
        )}
      </div>

      {/* Нижняя плашка */}
      <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 font-body text-xs uppercase tracking-[0.3em] text-neutral-700/60">
        Powered by Mistral AI
      </div>
    </div>
  );
};

export default Index;
