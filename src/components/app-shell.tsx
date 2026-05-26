import Image from "next/image";
import Link from "next/link";
import { BarChart3, Grid3X3, Heart, Home, Settings, ScrollText } from "lucide-react";
import { pet } from "@/lib/mock-data";

const navItems = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/timeline", label: "Timeline", icon: ScrollText },
  { href: "/app/mosaic", label: "Mosaic", icon: Grid3X3 },
  { href: "/app/reports", label: "Reports", icon: BarChart3 },
  { href: "/app/settings", label: "Settings", icon: Settings }
];

export function AppShell({
  children,
  active,
  petName = pet.name,
  petAvatar = pet.avatar
}: {
  children: React.ReactNode;
  active?: string;
  petName?: string;
  petAvatar?: string | null;
}) {
  return (
    <div className="min-h-dvh bg-background pb-28">
      <TopBar petName={petName} petAvatar={petAvatar} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pt-24 md:px-12 md:pt-32">
        {children}
      </main>
      <BottomNav active={active} />
    </div>
  );
}

export function TopBar({
  petName = pet.name,
  petAvatar = pet.avatar
}: {
  petName?: string;
  petAvatar?: string | null;
}) {
  const avatar = petAvatar ?? pet.avatar;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-transparent bg-background/75 px-6 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/app" className="flex items-center gap-3">
          <Image src={avatar} alt={`${petName} avatar`} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
          <span className="hidden font-display text-2xl font-semibold text-primary md:block">PawMemo</span>
        </Link>
        <Link href="/app" className="font-display text-2xl font-semibold text-primary md:hidden">
          PawMemo
        </Link>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-surface-muted" aria-label="Favorites">
          <Heart size={21} />
        </button>
      </div>
    </header>
  );
}

function BottomNav({ active }: { active?: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-line bg-surface/80 px-3 pb-6 pt-3 backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label.toLowerCase();
          return (
            <li key={item.href}>
              <Link
                href={item.href}
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
