"use client";

import PageHeader from "@/components/PageHeader";
import { Smartphone, Bluetooth, RefreshCw, AlertTriangle } from "lucide-react";

import { formatDate } from "@/lib/format";

import { Row } from "./components";

import { usePatientDevicesModel } from "./hooks";
export default function PatientDevices() {
  const { user, sync, loading, error, load } = usePatientDevicesModel();
  if (!user) {
    return (
      <>
        <PageHeader title="My devices" />
        <div className="card p-8 text-center text-sm text-slate-500">
          Not signed in.{" "}
          <a href="/login" className="text-brand-600 font-medium">
            Log on
          </a>
          .
        </div>
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="My devices"
        subtitle="Devices linked to your account. Pairing happens in the Transcend mobile app."
        actions={
          <button className="btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        }
      />

      {error && (
        <div className="card p-3 mb-4 flex items-start gap-2 bg-red-50 border-red-100 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
        </div>
      )}

      <div className="card p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {user.transcendDevice ?? "Transcend miniCPAP"}
              </h2>
              <p className="text-sm text-slate-500">
                Device ID <span className="font-mono">{user.deviceId ?? "—"}</span>
              </p>
            </div>
            <span className="badge badge-green">Active</span>
          </div>
          <dl className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Row
              label="Last sync"
              value={sync?.lastSyncDate ? formatDate(sync.lastSyncDate, true) : "—"}
            />
            <Row label="Last event" value={sync?.lastEvent ?? "—"} />
            <Row
              label="Last setting sync"
              value={sync?.lastSettingSyncDate ? formatDate(sync.lastSettingSyncDate, true) : "—"}
            />
            <Row label="Therapy user" value={user.cpapUser ?? "—"} />
            <Row label="Time zone" value={user.timeZone ?? "—"} />
            <Row label="Provider" value={user.provider ?? "—"} />
          </dl>
        </div>
      </div>

      <div className="card p-5 mt-5">
        <div className="flex items-start gap-3">
          <Bluetooth className="w-5 h-5 text-brand-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Sync from your phone</h3>
            <p className="text-sm text-slate-600 mt-1">
              Pairing a Transcend miniCPAP requires Bluetooth and is done from the Transcend mobile
              app. Once paired, sync from the app and your data appears here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
