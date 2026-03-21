export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="mb-8">
        <span className="font-mono text-xl font-semibold text-white">
          EnvSpace
        </span>
      </div>
      {children}
    </div>
  );
}
