"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { getCurrentEndUser } from "@/lib/auth";
import { formatDate, formatDateTime, formatPhone } from "@/lib/format";
import { nameForCode } from "@/lib/countries";
import type { EndUser } from "@/lib/types.api";

export default function PatientProfile() {
  const [user, setUser] = useState<EndUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getCurrentEndUser());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <>
        <PageHeader title="Profile" subtitle="Personal and prescription information." />
        <div className="card p-5 text-sm text-slate-500">Loading…</div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader title="Profile" subtitle="Personal and prescription information." />
        <div className="card p-5 text-sm text-slate-500">
          We couldn't load your profile. Please sign in again.
        </div>
      </>
    );
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—";
  const countryName = user.country ? nameForCode(user.country) : "";

  return (
    <>
      <PageHeader title="Profile" subtitle="Personal and prescription information." />

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Personal</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Full name" value={fullName} />
            <Row label="Email" value={user.email || "—"} />
            <Row label="Date of birth" value={formatDate(user.dob) || "—"} />
            <Row label="Gender" value={user.gender || "—"} />
            <Row label="Mobile" value={formatPhone(user.mobile) || "—"} />
            <Row label="Occupation" value={user.occupation || "—"} />
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Address</h2>
          <dl className="space-y-3 text-sm">
            <Row label="City" value={user.city || "—"} />
            <Row label="State / Province" value={user.state || "—"} />
            <Row label="Country" value={countryName || user.country || "—"} />
            <Row label="Time zone" value={user.timeZone || "—"} />
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Therapy</h2>
          <dl className="space-y-3 text-sm">
            <Row label="CPAP user" value={user.cpapUser || "—"} />
            <Row label="Transcend device" value={user.transcendDevice || "—"} />
            <Row label="Device ID" value={user.deviceId || "—"} />
          </dl>
          <p className="text-xs text-slate-500 mt-4">
            To update prescription details, contact your prescribing physician.
          </p>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Care team & sync</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Homecare provider" value={user.provider || "—"} />
            <Row label="Provider email" value={user.providerEmail || "—"} />
            <Row label="Last sync" value={formatDateTime(user.lastSyncDate) || "—"} />
            <Row label="Last setting sync" value={formatDateTime(user.lastSettingSyncDate) || "—"} />
            <Row label="Last event" value={user.lastEvent || "—"} />
          </dl>
        </div>
      </div>

      <div className="card p-5 mt-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Security</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <button className="btn-secondary">Change password</button>
          <button className="btn-secondary">Enable 2FA</button>
          <button className="btn-danger">Delete account</button>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-slate-100 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium text-right break-all">{value}</dd>
    </div>
  );
}
