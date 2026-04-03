"use client";

import { useState } from "react";

export function CopyRoleLink({ url, inline }: { url: string; inline?: boolean }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  }

  const btn =
    "inline-flex min-h-8 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white px-2.5 text-xs font-semibold text-warm-ink hover:bg-stone-50";

  if (inline) {
    return (
      <div className="flex min-w-0 max-w-[min(100%,28rem)] flex-1 items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-warm-ink" title={url}>
          {url}
        </span>
        <button type="button" onClick={copy} className={btn}>
          {done ? "Copied" : "Copy"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        readOnly
        value={url}
        className="min-h-11 min-w-0 flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 font-mono text-sm text-warm-ink"
        aria-label="Share link"
      />
      <button type="button" onClick={copy} className={`${btn} min-h-11 px-4 text-sm`}>
        {done ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
