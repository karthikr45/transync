"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getCurrentEndUser,
  getCurrentUser,
  getUserKind,
} from "@/lib/auth";
import type { UserType } from "@/lib/types.api";

type Props = {
  requireKind: "home-care" | "end-user";
  requireRole?: "super_admin" | "user";
  requireUserType?: UserType;
  children: React.ReactNode;
};

export default function AuthGuard({
  requireKind,
  requireRole,
  requireUserType,
  children,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const kind = getUserKind();
    const goLogin = () => {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    };

    if (kind !== requireKind) {
      goLogin();
      return;
    }

    if (requireKind === "home-care") {
      const user = getCurrentUser();
      if (!user) { goLogin(); return; }
      if (requireRole && user.role !== requireRole) { goLogin(); return; }
      if (requireUserType && user.userType !== requireUserType) { goLogin(); return; }
    } else {
      const eu = getCurrentEndUser();
      if (!eu) { goLogin(); return; }
    }

    setReady(true);
  }, [router, pathname, requireKind, requireRole, requireUserType]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
