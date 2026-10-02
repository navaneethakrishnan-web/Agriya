import { useEffect, useRef, useState } from 'react';
import { Send, Mic, Paperclip, Plus, Languages, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Card } from '@/components/ui/Card';
import { askAgriya } from '@/services/ai/chat';
import { useSpeechToText } from '@/hooks/useSpeech';
import { useAuth } from '@/context/AuthContext';
import { saveThread, listThreads } from '@/services/chatHistory';
import type { ChatMessage, ChatThread } from '@/types';
import { cn } from '@/lib/utils';

const LANGUAGES = ['English', 'हिन्दी', 'தமிழ்', 'తెలుగు', 'ಕನ್ನಡ', 'മലയാളം'];

function newThread(): ChatThread {
  return {
    id: crypto.randomUUID(),
    title: 'New conversation',
    updatedAt: Date.now(),
    messages: [
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          "Namaste! I'm AGRIYA. Ask me about crop diseases, pests, soil health, weather, or government schemes — I'll answer only from verified sources.",
        timestamp: Date.now(),
      },
    ],
  };
}

export default function Chat() {
  const { profile, firebaseUser } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([newThread()]);
  const [activeId, setActiveId] = useState(threads[0].id);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showHistory, setShowHistory] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; name: string; kind: 'image' | 'pdf' } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { start, listening, supported } = useSpeechToText();

  const active = threads.find((t) => t.id === activeId)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active.messages.length, sending]);

  useEffect(() => {
    if (firebaseUser) {
      listThreads(firebaseUser.uid)
        .then((loaded) => {
          if (loaded.length) setThreads((prev) => [...loaded, ...prev.slice(1)]);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid]);

  function updateThread(updater: (t: ChatThread) => ChatThread) {
    setThreads((prev) => prev.map((t) => (t.id === activeId ? updater(t) : t)));
  }

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text && !attachment) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text || (attachment?.kind === 'image' ? 'Analyse this crop photo' : 'Analyse this document'),
      timestamp: Date.now(),
      imageUrl: attachment?.kind === 'image' ? attachment.url : undefined,
      fileName: attachment?.kind === 'pdf' ? attachment.name : undefined,
    };

    updateThread((t) => ({
      ...t,
      title: t.messages.length <= 1 ? text.slice(0, 40) || 'New conversation' : t.title,
      messages: [...t.messages, userMsg],
      updatedAt: Date.now(),
    }));
    setInput('');
    setAttachment(null);
    setSending(true);

    try {
      const history = active.messages.map((m) => ({ role: m.role, content: m.content }));
      const result = await askAgriya(userMsg.content, history, language);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.answer,
        timestamp: Date.now(),
        confidence: result.confidence,
        sources: result.sources,
      };

      updateThread((t) => ({ ...t, messages: [...t.messages, assistantMsg], updatedAt: Date.now() }));

      if (firebaseUser) {
        const updated = threads.find((t) => t.id === activeId);
        if (updated) {
          saveThread(firebaseUser.uid, {
            ...updated,
            messages: [...updated.messages, userMsg, assistantMsg],
          }).catch(() => {});
        }
      }
    } finally {
      setSending(false);
    }
  }

  function handleRetry() {
    const msgs = active.messages;
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (lastUser) handleSend(lastUser.content);
  }

  function handleLike(messageId: string, dir: 'up' | 'down') {
    updateThread((t) => ({
      ...t,
      messages: t.messages.map((m) => (m.id === messageId ? { ...m, liked: dir } : m)),
    }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAttachment({ url, name: file.name, kind: file.type.startsWith('image/') ? 'image' : 'pdf' });
  }

  const lastAssistant = [...active.messages].reverse().find((m) => m.role === 'assistant');
  const followUps: string[] = lastAssistant?.sources?.length
    ? []
    : [];

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-5xl gap-4 md:h-[calc(100vh-4rem)]">
      {/* History sidebar (mobile: drawer) */}
      <AnimatePresence>
        {(showHistory || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className={cn(
              'w-64 shrink-0 glass rounded-2xl p-3 lg:block',
              showHistory ? 'fixed inset-y-4 left-4 z-40 block' : 'hidden'
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-canopy-900 dark:text-cream-50">Chats</p>
              <button
                onClick={() => {
                  const t = newThread();
                  setThreads((prev) => [t, ...prev]);
                  setActiveId(t.id);
                  setShowHistory(false);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-canopy-700 text-cream-50"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-1 overflow-y-auto">
              {threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveId(t.id);
                    setShowHistory(false);
                  }}
                  className={cn(
                    'block w-full truncate rounded-xl px-3 py-2 text-left text-sm',
                    t.id === activeId
                      ? 'bg-canopy-700 text-cream-50'
                      : 'text-canopy-800 dark:text-cream-200 hover:bg-canopy-100 dark:hover:bg-canopy-800'
                  )}
                >
                  {t.title}
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <Card strong className="flex flex-1 flex-col overflow-hidden !p-0">
        <div className="flex items-center justify-between border-b border-canopy-200/50 dark:border-canopy-700/50 px-4 py-3">
          <button onClick={() => setShowHistory((s) => !s)} className="lg:hidden text-sm font-medium text-canopy-700 dark:text-cream-200">
            History
          </button>
          <div className="hidden lg:block" />
          <p className="font-display text-sm font-semibold text-canopy-950 dark:text-cream-50">AGRIYA Assistant</p>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex items-center gap-1 rounded-full border border-canopy-300 dark:border-canopy-700 bg-transparent px-2.5 py-1 text-xs text-canopy-700 dark:text-cream-200"
            >
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {active.messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              onLike={(dir) => handleLike(m.id, dir)}
              onRetry={handleRetry}
            />
          ))}
          {sending && (
            <div className="flex gap-1 rounded-2xl rounded-bl-md bg-cream-50 dark:bg-canopy-800 px-4 py-3 w-fit">
              <TypingDot /> <TypingDot delay={0.15} /> <TypingDot delay={0.3} />
            </div>
          )}
          {!sending && followUps.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {followUps.map((f) => (
                <button
                  key={f}
                  onClick={() => handleSend(f)}
                  className="rounded-full border border-canopy-300 dark:border-canopy-700 px-3 py-1.5 text-xs text-canopy-700 dark:text-cream-200 hover:bg-canopy-100 dark:hover:bg-canopy-800"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {attachment && (
          <div className="flex items-center gap-2 border-t border-canopy-200/50 dark:border-canopy-700/50 px-4 py-2">
            {attachment.kind === 'image' ? (
              <img src={attachment.url} className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <span className="text-xs text-canopy-700 dark:text-cream-200">{attachment.name}</span>
            )}
            <button onClick={() => setAttachment(null)}><X size={14} className="text-canopy-500" /></button>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-canopy-200/50 dark:border-canopy-700/50 p-3">
          <label className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-canopy-600 hover:bg-canopy-100 dark:hover:bg-canopy-800 dark:text-canopy-300">
            <Paperclip size={17} />
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
          </label>
          {supported && (
            <button
              onClick={() => start((text) => setInput((prev) => (prev ? prev + ' ' : '') + text))}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-canopy-600 hover:bg-canopy-100 dark:hover:bg-canopy-800 dark:text-canopy-300',
                listening && 'animate-pulse bg-canopy-100 dark:bg-canopy-800'
              )}
            >
              <Mic size={17} />
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about crops, pests, weather, schemes…"
            className="flex-1 rounded-full bg-cream-50/70 dark:bg-canopy-800/60 px-4 py-2.5 text-sm outline-none placeholder:text-canopy-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={sending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canopy-700 text-cream-50 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </Card>
    </div>
  );
}

function TypingDot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="h-1.5 w-1.5 rounded-full bg-canopy-400"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ repeat: Infinity, duration: 1, delay }}
    />
  );
}

// Suppress unused-import lint noise for icons kept for future use in header.
void Languages;
