import { Copy, Share2, ThumbsUp, ThumbsDown, RotateCcw, Volume2, FileText, Image as ImageIcon } from 'lucide-react';
import { Markdown } from './Markdown';
import { Badge } from '@/components/ui/Card';
import { speak } from '@/hooks/useSpeech';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  message: ChatMessage;
  onLike?: (dir: 'up' | 'down') => void;
  onRetry?: () => void;
}

export function MessageBubble({ message, onLike, onRetry }: Props) {
  const isUser = message.role === 'user';

  function copy() {
    navigator.clipboard.writeText(message.content);
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ text: message.content });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', isUser ? 'items-end' : 'items-start')}>
      {message.fileName && (
        <span className="flex items-center gap-1.5 rounded-lg bg-canopy-100 dark:bg-canopy-800 px-2.5 py-1 text-xs text-canopy-700 dark:text-cream-200">
          <FileText size={12} /> {message.fileName}
        </span>
      )}
      {message.imageUrl && (
        <img src={message.imageUrl} alt="uploaded" className="max-w-[220px] rounded-2xl border border-canopy-200/60" />
      )}

      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%]',
          isUser
            ? 'rounded-br-md bg-canopy-700 text-cream-50'
            : 'rounded-bl-md bg-cream-50 dark:bg-canopy-800 text-canopy-900 dark:text-cream-100 shadow-sm'
        )}
      >
        <Markdown content={message.content} />
      </div>

      {!isUser && message.confidence !== undefined && message.content && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={message.confidence > 0.6 ? 'canopy' : message.confidence > 0.22 ? 'gold' : 'soil'}>
            Confidence: {Math.round(message.confidence * 100)}%
          </Badge>
          {message.sources?.map((s) => (
            <Badge key={s.id} tone="olive">{s.type}</Badge>
          ))}
        </div>
      )}

      {!isUser && message.content && (
        <div className="flex items-center gap-1 text-canopy-500 dark:text-canopy-400">
          <IconBtn onClick={() => speak(message.content)} label="Listen"><Volume2 size={14} /></IconBtn>
          <IconBtn onClick={copy} label="Copy"><Copy size={14} /></IconBtn>
          <IconBtn onClick={share} label="Share"><Share2 size={14} /></IconBtn>
          <IconBtn onClick={() => onLike?.('up')} label="Helpful" active={message.liked === 'up'}>
            <ThumbsUp size={14} />
          </IconBtn>
          <IconBtn onClick={() => onLike?.('down')} label="Not helpful" active={message.liked === 'down'}>
            <ThumbsDown size={14} />
          </IconBtn>
          <IconBtn onClick={onRetry} label="Retry"><RotateCcw size={14} /></IconBtn>
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full hover:bg-canopy-100 dark:hover:bg-canopy-800',
        active && 'bg-canopy-100 text-canopy-700 dark:bg-canopy-800 dark:text-canopy-200'
      )}
    >
      {children}
    </button>
  );
}

export function UploadPreviewIcon({ type }: { type: 'image' | 'pdf' }) {
  return type === 'image' ? <ImageIcon size={14} /> : <FileText size={14} />;
}
