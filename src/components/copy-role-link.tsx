"use client";

import { useState } from "react";

export function CopyRoleLink({ url }: { url: string }) {
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

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        readOnly
        value={url}
        className="min-h-11 min-w-0 flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 font-mono text-sm text-warm-ink"
        aria-label="Share link"
      />
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-warm-ink hover:bg-stone-50"
      >
        {done ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
