export default function OpsLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-hidden bg-zinc-100">
      {children}
    </div>
  );
}