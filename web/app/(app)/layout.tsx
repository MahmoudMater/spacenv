import { TopNav } from "@/components/layout/top-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <TopNav />
      <main className="pt-12">{children}</main>
    </div>
  );
}
