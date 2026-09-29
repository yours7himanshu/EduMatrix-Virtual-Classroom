import { Check, Play, Radio } from "lucide-react";

const bullets = ["HD live video with chat, polls and hand-raise", "Auto-recordings, notes and attendance included", "Works on low bandwidth across all devices"];

const VideoSection = () => {
  return (
    <div data-aos="fade-up" className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-ink-900/10 shadow-card p-4 sm:p-6 md:p-8 lg:p-10 grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center overflow-hidden">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-500/15 text-red-600 text-[10.5px] sm:text-[11px] font-extrabold tracking-[0.16em] px-3.5 sm:px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> LIVE CLASSES
        </p>
        <h2 className="font-display text-[1.65rem] leading-[1.1] min-[420px]:text-3xl md:text-4xl font-extrabold tracking-tight mt-3 sm:mt-4 text-ink-900">Interactive live learning</h2>
        <p className="mt-2.5 sm:mt-3 text-ink-500 text-[13.5px] sm:text-[15px] leading-relaxed">Engage in real-time with interactive live lectures, chat and polls. Seamless communication between students and teachers in one calm room.</p>
        <ul className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 sm:gap-3 text-[13px] sm:text-sm font-semibold text-ink-800 leading-snug">
              <span className="grid h-5 w-5 sm:h-6 sm:w-6 shrink-0 place-items-center rounded-full bg-accent-mint/15 text-accent-mint"><Check size={13} strokeWidth={3} /></span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-col min-[420px]:flex-row gap-3">
          <button className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-ink-900 text-white text-sm font-bold px-6 py-3 hover:bg-brand-600 active:scale-[0.99] transition-all">
            <Radio size={16} /> Live Class
          </button>
          <a href="#features" className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white border border-ink-900/15 text-sm font-bold px-6 py-3 hover:border-ink-900 hover:shadow-soft active:scale-[0.99] transition-all">Learn More</a>
        </div>
      </div>
      <div className="relative">
        <div className="absolute -inset-4 bg-brand-200/50 blur-2xl rounded-[2rem] pointer-events-none" />
        <video src="/videos/project.mp4" autoPlay muted loop playsInline className="relative w-full rounded-2xl border border-ink-900/10 shadow-card object-cover aspect-video bg-ink-900" />
        <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-ink-900/90 glass text-white text-[11px] font-extrabold tracking-widest px-3.5 py-1.5 border border-white/20">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> LIVE
        </div>
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto inline-flex items-center gap-3 rounded-2xl glass bg-white/85 border border-white/60 shadow-card px-4 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-white"><Play size={16} fill="currentColor" className="ml-0.5" /></span>
          <span><span className="block text-[13px] font-extrabold text-ink-900">Physics 101 is live now</span><span className="block text-xs font-medium text-ink-500">248 watching � Join in one tap</span></span>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
