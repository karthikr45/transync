"use client";
import UiButton from "@/components/ui/Button";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { logout } from "@/lib/auth";

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

export default function PortalShell({
  role,
  user,
  nav,
  children,
}: {
  role: string;
  user: { name: string; email: string };
  nav: NavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside
        className="w-full md:w-64 shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 md:sticky md:top-0 md:self-start md:h-screen flex flex-col"
        aria-label={`${role} navigation`}
      >
        <div className="px-5 py-5 border-b border-slate-200">
          <Link href="/" className="block" aria-label="Transcend home">
            <Logo className="h-7 w-auto" />
            <div className="text-xs text-slate-500 mt-1.5">{role}</div>
          </Link>
        </div>
        <nav
          className="flex md:block md:flex-1 min-h-0 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto p-3 gap-1 md:space-y-1"
          aria-label="Primary"
        >
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${active ? "nav-link-active" : "nav-link"} shrink-0 whitespace-nowrap`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-200 flex md:block items-center gap-2">
          <div className="px-3 py-2 min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900 truncate">{user.name}</div>
            <div className="text-xs text-slate-500 truncate">{user.email}</div>
          </div>
          <UiButton
            variant="plain"
            type="button"
            onClick={logout}
            className="nav-link shrink-0 md:w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </UiButton>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
