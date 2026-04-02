import Link from "next/link";

type LogoMarkProps = {
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
};

/** Rounded “wp” monogram on accent — matches favicon / app icons. */
export function LogoMark({ size = 36, className, "aria-hidden": ariaHidden = true }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden={ariaHidden}
    >
      <rect width="32" height="32" rx="8" className="fill-warm-accent" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="#faf8f5"
        style={{
          fontFamily: "var(--font-plus-jakarta), ui-sans-serif, system-ui, sans-serif",
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        wp
      </text>
    </svg>
  );
}

type LogoWordmarkProps = {
  href?: string;
  className?: string;
  markSize?: number;
};

export function LogoWordmark({ href = "/", className, markSize = 34 }: LogoWordmarkProps) {
  const inner = (
    <>
      <LogoMark size={markSize} />
      <span className="font-serif text-xl font-semibold tracking-tight text-warm-ink">Warmpath</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
        {inner}
      </Link>
    );
  }

  return <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>{inner}</span>;
}
