export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="p-3 border-b border-[var(--border)] bg-[var(--bg-panel)] sticky top-0 z-10">
      <h2 className="text-sm font-medium">{title}</h2>
    </div>
  );
}