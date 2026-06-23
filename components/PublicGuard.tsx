"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  destinationForUser,
  getCurrentEndUser,
  getCurrentUser,
  getUserKind,
} from "@/lib/auth";

/**
 * Wraps a public auth page (login / register). If the user is already
 * signed in, sends them to the right portal instead of letting them
 * view the auth screen. The replace navigation drops the auth route
 * from history so the browser Back button doesn't take them back to
 * the same screen.
 */
export default function PublicGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const search = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const next = search.get("next");
    const safeNext = next && /^\/(provider|monitor|admin|patient)(\/|$)/.test(next) ? next : null;

    const kind = getUserKind();
    if (kind === "home-care") {
      const user = getCurrentUser();
      if (user) { router.replace(safeNext ?? destinationForUser(user)); return; }
    } else if (kind === "end-user") {
      const eu = getCurrentEndUser();
      if (eu) { router.replace(safeNext ?? "/patient/dashboard"); return; }
    }
    setReady(true);
  }, [router, search]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
