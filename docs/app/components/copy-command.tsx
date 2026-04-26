import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyCommand({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Best-effort fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch {}
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? 'Copied' : `Copy "${value}" to clipboard`}
      className="group inline-flex items-center gap-3 rounded-md border border-fd-border bg-fd-card px-4 py-2 text-sm text-fd-muted-foreground font-mono hover:bg-fd-accent/40 transition-colors cursor-pointer"
    >
      <span>
        <span className="text-fd-muted-foreground/60">$ </span>
        <span className="text-fd-foreground">{value}</span>
      </span>
      <span
        aria-hidden
        className="inline-flex items-center justify-center size-5 rounded-md text-fd-muted-foreground group-hover:text-fd-foreground transition-colors"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-500" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
}
