import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sprout,
  Mic,
  MessageCircle,
  Users,
  CloudSun,
  Landmark,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const DEMO_EXCHANGE = [
  { role: 'user', text: 'என் நெல் இலைகளில் சாம்பல் புள்ளிகள் இருக்கு' },
  {
    role: 'assistant',
    text: 'This matches rice blast symptoms. Avoid excess nitrogen, ensure drainage, and apply a recommended fungicide at first sign. Confidence: 92%',
  },
];

const FEATURES = [
  {
    icon: MessageCircle,
    title: 'Ask AGRIYA anything',
    body: 'A WhatsApp-style chatbot that answers in your language, by voice or text, grounded only in verified agricultural sources — never guesses.',
  },
  {
    icon: Users,
    title: 'Farmer-powered community',
    body: 'Post what stumped the AI. Fellow farmers answer, upvote the best replies, and unresolved questions reach an Agriculture Officer within 48 hours.',
  },
  {
    icon: CloudSun,
    title: 'Hyperlocal weather calls',
    body: 'Live forecasts translated into what to actually do this week — spray, irrigate, sow, or wait.',
  },
  {
    icon: Landmark,
    title: 'Every scheme, one place',
    body: 'Search and filter subsidies and schemes by state, crop, and eligibility, then apply without the runaround.',
  },
  {
    icon: Award,
    title: 'Rewarded for helping',
    body: 'Earn points for good answers and daily check-ins, redeemable for seeds, fertilizer, and equipment discounts.',
  },
];

export default function Landing() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, DEMO_EXCHANGE.length)), 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-canopy-950 leaf-vein-bg overflow-x-hidden">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-canopy-700 text-cream-50">
            <Sprout size={18} />
          </div>
          <span className="font-display text-xl font-semibold text-canopy-900 dark:text-cream-100">
            AGRIYA
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-canopy-800 dark:text-cream-100 hover:text-canopy-600"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-canopy-700 px-5 py-2 text-sm font-medium text-cream-50 shadow-md shadow-canopy-800/20 hover:bg-canopy-600 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-24 pt-10 md:grid-cols-2 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canopy-100 dark:bg-canopy-800 px-3 py-1 text-xs font-medium text-canopy-700 dark:text-canopy-200">
            <Sprout size={12} /> Built for Bharat's farmers
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-canopy-950 dark:text-cream-50 md:text-5xl">
            Answers a farmer can trust, in the language they speak.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-canopy-800/80 dark:text-cream-200/80">
            AGRIYA combines an AI advisor grounded in verified agricultural
            sources, a peer community, and direct Agriculture Officer
            escalation — so no question about crops, pests, weather, or
            schemes ever goes unanswered.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-canopy-700 px-6 py-3 text-sm font-medium text-cream-50 shadow-lg shadow-canopy-800/25 hover:bg-canopy-600 transition-colors"
            >
              Join as a farmer <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-canopy-600 dark:border-canopy-400 px-6 py-3 text-sm font-medium text-canopy-700 dark:text-cream-100 hover:bg-canopy-100 dark:hover:bg-canopy-800 transition-colors"
            >
              I'm an Agriculture Officer
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-5 text-xs text-canopy-700/70 dark:text-cream-200/60">
            <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Free for farmers</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Works in regional languages</span>
          </div>
        </motion.div>

        {/* Signature element: live WhatsApp-style demo bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="glass-strong rounded-[2rem] p-4 shadow-2xl shadow-canopy-900/10">
            <div className="flex items-center gap-2 border-b border-canopy-200/50 dark:border-canopy-700/50 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-canopy-700 text-cream-50">
                <Sprout size={14} />
              </div>
              <div>
                <p className="text-sm font-semibold text-canopy-900 dark:text-cream-50">AGRIYA Assistant</p>
                <p className="text-[11px] text-canopy-600 dark:text-canopy-300">Online · answers in 12 languages</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 py-4 min-h-[160px]">
              {DEMO_EXCHANGE.slice(0, step).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cnBubble(msg.role)}
                >
                  {msg.text}
                </motion.div>
              ))}
              {step < DEMO_EXCHANGE.length && (
                <span className="flex gap-1 pl-2">
                  <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-cream-50/70 dark:bg-canopy-800/60 px-3 py-2">
              <Mic size={16} className="text-canopy-600 dark:text-canopy-300" />
              <span className="text-xs text-canopy-500 dark:text-canopy-400">Tap to speak your question…</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-display text-2xl font-semibold text-canopy-950 dark:text-cream-50 md:text-3xl">
          Everything a farmer needs, in one field.
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-canopy-700/10 text-canopy-700 dark:bg-canopy-400/10 dark:text-canopy-300">
                <f.icon size={20} />
              </div>
              <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-canopy-800/75 dark:text-cream-200/70">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-canopy-200/60 dark:border-canopy-800/60 px-6 py-8 text-center text-xs text-canopy-600 dark:text-canopy-400">
        Built by Team Regal Hackers — Smart India Hackathon 2025 · SIH25076
      </footer>
    </div>
  );
}

function cnBubble(role: string) {
  return role === 'user'
    ? 'self-end max-w-[80%] rounded-2xl rounded-br-md bg-canopy-700 text-cream-50 px-3.5 py-2 text-sm'
    : 'self-start max-w-[85%] rounded-2xl rounded-bl-md bg-cream-50 dark:bg-canopy-800 text-canopy-900 dark:text-cream-100 px-3.5 py-2 text-sm shadow-sm';
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="h-1.5 w-1.5 rounded-full bg-canopy-400"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ repeat: Infinity, duration: 1, delay }}
    />
  );
}
