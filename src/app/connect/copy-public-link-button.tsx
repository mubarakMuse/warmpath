"use client";

import { useState } from "react";

export function CopyPublicLinkButton({ url, label = "Copy public link" }: { url: string; label?: string }) {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function copy() {
    setErr(null);
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      setErr("Could not copy — copy the URL manually.");
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex min-h-10 items-center rounded-lg border border-amber-800/40 bg-amber-50 px-4 text-sm font-semibold text-amber-950 hover:bg-amber-100"
      >
        {done ? "Copied" : label}
      </button>
      {err ? <p className="text-xs text-red-700">{err}</p> : null}
      <p className="font-mono text-[10px] text-stone-500 break-all">{url}</p>
    </div>
  );
}
