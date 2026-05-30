import Image from "next/image";
import Link from "next/link";
import { BarChart3, Home, PawPrint, Settings, ScrollText } from "lucide-react";

const navItems = [
  { href: "/app", key: "home", label: "Journal", icon: Home },
  { href: "/app/timeline", key: "timeline", label: "Timeline", icon: ScrollText },
  { href: "/app/reports", key: "reports", label: "Reports", icon: BarChart3 },
  { href: "/app/settings", key: "settings", label: "Settings", icon: Settings }
];

export function AppShell({
  children,
  active,
  petName = "your pet",
  petAvatar = null
}: {
  children: React.ReactNode;
  active?: string;
  petName?: string;
  petAvatar?: string | null;
}) {
  return (
    <div className="min-h-dvh bg-background pb-28">
      <TopBar active={active} petName={petName} petAvatar={petAvatar} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pt-24 md:px-12 md:pt-32">
        {children}
      </main>
      <BottomNav active={active} />
    </div>
  );
}

export function TopBar({
  active,
  petName = "your pet",
  petAvatar = null
}: {
  active?: string;
  petName?: string;
  petAvatar?: string | null;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-transparent bg-background/75 px-6 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/app" className="flex items-center gap-3">
          {petAvatar ? (
            <Image src={petAvatar} alt={`${petName} avatar`} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <PawPrint size={19} />
            </span>
          )}
          <span className="hidden font-display text-2xl font-semibold text-primary md:block">PawMemo</span>
        </Link>
        <Link href="/app" className="font-display text-2xl font-semibold text-primary md:hidden">
          PawMemo
        </Link>
        <DesktopNav active={active} />
      </div>
    </header>
  );
}

function DesktopNav({ active }: { active?: string }) {
  return (
    <nav className="hidden items-center gap-1 rounded-full border border-surface-line bg-surface/70 p-1 shadow-ambient md:flex" aria-label="App navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive ? "bg-secondary-soft text-secondary" : "text-outline hover:bg-surface-muted hover:text-primary"
            }`}
          >
            <Icon size={16} strokeWidth={isActive ? 2.6 : 2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BottomNav({ active }: { active?: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-line bg-surface/90 px-3 pb-6 pt-3 backdrop-blur-xl md:hidden" aria-label="App navigation">
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-w-14 flex-col items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition ${
                  isActive ? "text-primary" : "text-outline"
                }`}
              >
                <span className={`flex h-8 w-14 items-center justify-center rounded-full ${isActive ? "bg-secondary-soft text-secondary" : ""}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.6 : 2} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
