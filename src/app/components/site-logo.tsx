import Link from "next/link";

export function SiteLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 text-warm-ink no-underline ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/warmpath-mark.svg" alt="" width={44} height={44} className="shrink-0 rounded-xl shadow-sm" />
      <span className="font-serif text-2xl font-semibold tracking-tight">Warmpath</span>
    </Link>
  );
}
