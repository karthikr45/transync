"use client";

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
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col" aria-label={`${role} navigation`}>
        <div className="px-5 py-5 border-b border-slate-200">
          <Link href="/" className="block" aria-label="Transcend home">
            <Logo className="h-7 w-auto" />
            <div className="text-xs text-slate-500 mt-1.5">{role}</div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1" aria-label="Primary">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} className={active ? "nav-link-active" : "nav-link"}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="px-3 py-2">
            <div className="text-sm font-medium text-slate-900 truncate">{user.name}</div>
            <div className="text-xs text-slate-500 truncate">{user.email}</div>
          </div>
          <button type="button" onClick={logout} className="nav-link w-full text-left">
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
