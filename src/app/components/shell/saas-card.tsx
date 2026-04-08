export function SaasCard({
  children,
  className = "",
  padding = "p-6",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-stone-200/90 bg-white shadow-sm ${padding} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
