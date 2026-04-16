"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Layers,
  Activity,
  Settings2,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { CodeStudioMark } from "@/components/codestudio-mark";

const DSA_NAV = [
  { href: "/", label: "Today", icon: Home },
  { href: "/library", label: "Library", icon: Layers },
  { href: "/progress", label: "Progress", icon: Activity },
];

const SQL_NAV = [
  { href: "/sql", label: "Today", icon: Home },
  { href: "/sql/library", label: "Library", icon: Layers },
  { href: "/sql/progress", label: "Progress", icon: Activity },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const prefs = useApp((s) => s.prefs);
  const xp = useApp((s) => s.xp);
  const level = useApp((s) => s.level());
  const streak = useApp((s) => s.streak);

  // Nav reflects the user's chosen track. One track at a time — switching
  // happens in Settings, never inline in the sidebar.
  const nav = prefs.tracks === "sql" ? SQL_NAV : DSA_NAV;

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", prefs.theme === "dark");
  }, [prefs.theme, hydrated]);

  return (
    <div className="min-h-screen bg-bg text-fg flex">
      {/* Sidebar — icon + label, no dead space */}
      <aside className="hidden md:flex w-[200px] shrink-0 border-r border-border bg-bg-elevated/20 flex-col">
        {/* Wordmark — inline SVG mark + gradient wordmark */}
        <div className="px-5 pt-7 pb-5">
          <Link href="/" className="flex items-center gap-2.5">
            <CodeStudioMark size={32} className="shrink-0" />
            <div className="font-display text-[1.15rem] font-normal tracking-tight leading-none text-fg">
              CodeStudio
            </div>
          </Link>
        </div>

        {/* Nav — reflects the user's chosen track (from Settings) */}
        <nav className="px-3 flex-1 space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/" && item.href !== "/sql" && pathname.startsWith(item.href)) ||
              (item.href === "/sql" && pathname === "/sql");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "text-fg bg-white/[0.06]"
                    : "text-zinc-500 hover:text-fg hover:bg-white/[0.04]",
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    active ? "text-brand" : "text-zinc-600",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* XP card */}
        <div className="p-3">
          <div className="rounded-xl border border-border bg-bg-elevated p-4">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Level {hydrated ? level : "—"}</span>
              <span className="inline-flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-400" />
                {hydrated ? streak : 0}d
              </span>
            </div>
            <div className="mt-1.5 font-display text-2xl text-fg">
              {hydrated ? xp : 0}
              <span className="ml-1 text-xs text-zinc-600 font-sans">XP</span>
            </div>
          </div>
          <Link
            href="/settings"
            className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-600 hover:text-fg transition-colors"
          >
            <Settings2 className="h-3.5 w-3.5" /> Settings
          </Link>
        </div>
      </aside>

      {/* Main — full width, no centering cap */}
      <main className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden border-b border-border bg-bg-elevated/60 glass px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CodeStudioMark size={24} className="shrink-0" />
            <span className="font-display text-[1.1rem] font-normal tracking-tight text-fg">
              CodeStudio
            </span>
          </Link>
          <div className="text-[11px] text-zinc-500 tabular-nums">
            L{hydrated ? level : "—"}&nbsp;·&nbsp;{hydrated ? streak : 0}d
          </div>
        </header>

        {/* No max-width cap — content fills available space with modest padding */}
        <div className="px-5 md:px-8 py-5 md:py-8">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-bg-elevated/90 glass flex items-center justify-around py-2 z-50">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1 text-[10px] font-medium transition-colors",
                  active ? "text-brand" : "text-zinc-600",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
