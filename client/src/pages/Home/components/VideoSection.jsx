import { Check, Play, Radio, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const bullets = ["HD live video with chat, polls and hand-raise", "Auto-recordings, notes and attendance included", "Works on low bandwidth across all devices"];

// Desktop composition = original (white card, red pill, green-check bullets,
// paired pill CTAs, glow, glass overlays). Mobile is editorial and flat:
// small label, compact heading, short description, one 50px primary action
// plus a quiet text link — then the classroom preview as the visual focus.
const VideoSection = () => {
  const navigate = useNavigate();
  return (
    <div data-aos="fade-up" className="grid lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 items-center overflow-hidden sm:bg-white sm:rounded-[2rem] sm:border sm:border-ink-900/10 sm:shadow-card sm:p-6 md:p-8 lg:p-10">
      <div className="min-w-0">
        {/* Neutral section label on phones; original red pill on desktop */}
        <p className="sm:hidden text-[10.5px] font-extrabold tracking-[0.18em] text-ink-500">LIVE CLASSROOM</p>
        <p className="hidden sm:inline-flex max-w-full items-center gap-2 rounded-full bg-red-50 border border-red-500/15 text-red-600 text-[10.5px] sm:text-[11px] font-extrabold tracking-[0.16em] px-3.5 sm:px-4 py-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 animate-pulse" /> LIVE CLASSES
        </p>
        <h2 className="font-display text-[1.35rem] leading-[1.15] min-[420px]:text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5 sm:mt-4 text-ink-900 text-balance">Interactive live learning</h2>
        <p className="mt-1.5 sm:mt-3 text-ink-500 text-[13.5px] sm:text-[15px] leading-relaxed">Teach live with chat, polls and hand-raise — everything in one calm room.</p>
        {/* Mobile actions: single primary + quiet text link */}
        <div className="sm:hidden mt-4">
          <button
            onClick={() => navigate("/live-class")}
            className="inline-flex min-h-[50px] w-full max-w-full items-center justify-center gap-2 rounded-lg bg-ink-900 text-white text-[14.5px] font-bold px-5 hover:bg-brand-600 active:scale-[0.99] transition-colors"
          >
            <Radio size={15} className="shrink-0" />
            <span className="whitespace-nowrap leading-none">Join a live class</span>
          </button>
          <a href="#features" className="inline-flex min-h-[44px] items-center gap-1 text-[13.5px] font-bold text-brand-700 hover:text-brand-600 active:scale-[0.99] transition-colors">
            Learn more <ArrowRight size={14} className="shrink-0" />
          </a>
        </div>
        {/* Desktop: original green-check bullets + paired pill CTAs */}
        <ul className="hidden sm:block mt-4 sm:mt-6 space-y-2 sm:space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 sm:gap-3 text-[13px] sm:text-sm font-semibold text-ink-800 leading-snug">
              <span className="grid h-5 w-5 sm:h-6 sm:w-6 shrink-0 place-items-center rounded-full bg-accent-mint/15 text-accent-mint"><Check size={13} strokeWidth={3} /></span>
              <span className="min-w-0">{b}</span>
            </li>
          ))}
        </ul>
        <div className="hidden sm:flex mt-5 sm:mt-7 flex-col min-[420px]:flex-row gap-2.5 sm:gap-3">
          <button
            onClick={() => navigate("/live-class")}
            className="inline-flex min-h-[48px] max-w-full items-center justify-center gap-2 rounded-lg sm:rounded-full bg-ink-900 text-white text-sm font-bold px-6 py-3 hover:bg-brand-600 active:scale-[0.99] transition-all"
          >
            <Radio size={16} className="shrink-0" /> Live Class
          </button>
          <a href="#features" className="inline-flex min-h-[48px] max-w-full items-center justify-center rounded-lg sm:rounded-full bg-white border border-ink-900/15 text-sm font-bold px-6 py-3 hover:border-ink-900 hover:shadow-soft active:scale-[0.99] transition-all">Learn More</a>
        </div>
      </div>
      <div className="relative min-w-0">
        <div aria-hidden="true" className="hidden sm:block absolute -inset-4 bg-brand-200/50 blur-2xl rounded-[2rem] pointer-events-none" />
        <video src="/videos/project.mp4" autoPlay muted loop playsInline aria-label="Preview of a live EduMatrix classroom session" className="relative w-full rounded-xl sm:rounded-2xl border border-ink-900/10 sm:shadow-card object-cover aspect-video bg-ink-900" />
        {/* Red LIVE badge kept only here: it marks the actual session in preview */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-ink-900/90 glass text-white text-[10px] sm:text-[11px] font-extrabold tracking-widest px-3 sm:px-3.5 py-1.5 border border-white/20">
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 animate-pulse" /> LIVE
        </div>
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 lg:right-auto inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl glass bg-white/85 border border-white/60 shadow-card px-3 sm:px-4 py-2.5 sm:py-3 overflow-hidden">
          <span className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-full bg-ink-900 text-white"><Play size={15} fill="currentColor" className="ml-0.5" /></span>
          <span className="min-w-0 flex-1"><span className="block text-[12px] sm:text-[13px] font-extrabold text-ink-900 leading-tight truncate">Physics 101 is live now</span><span className="block text-[11px] sm:text-xs font-medium text-ink-500 leading-tight truncate">248 watching • Join in one tap</span></span>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
