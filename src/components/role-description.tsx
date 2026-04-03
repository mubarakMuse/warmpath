/**
 * Renders stored role description with readable typography.
 * - Blank lines → new paragraphs
 * - Single line breaks → kept (whitespace-pre-line per block)
 */
export function RoleDescription({
  text,
  variant = "public",
}: {
  text: string | null | undefined;
  variant?: "public" | "compact";
}) {
  const trimmed = text?.trim();
  if (!trimmed) return null;

  const paragraphs = trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  const wrap =
    variant === "public"
      ? "max-w-prose space-y-4 text-[15px] leading-[1.65] text-warm-muted [&>p:first-of-type]:text-[15.5px] [&>p:first-of-type]:text-warm-ink/90"
      : "max-w-2xl space-y-3 text-sm leading-relaxed text-warm-muted [&>p:first-of-type]:text-warm-ink/85";

  return (
    <div className={wrap}>
      {paragraphs.map((block, i) => (
        <p key={i} className="whitespace-pre-line">
          {block}
        </p>
      ))}
    </div>
  );
}

export function RoleDescriptionEmpty({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-sm italic text-warm-muted"}>No description provided yet.</p>
  );
}
