"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { devices, patients } from "@/lib/mock-data";
import { ArrowLeft, Ban } from "lucide-react";

export default function DeviceDetail() {
  const params = useParams();
  const serial = String(params.serial);
  const d = devices.find((x) => x.serial === serial);
  if (!d) notFound();
  const assigned = patients.find((p) => p.id === d.assignedPatientId);
  const [confirmDeact, setConfirmDeact] = useState(false);

  return (
    <>
      <Link href="/provider/devices" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to devices
      </Link>
      <PageHeader title={d.serial} subtitle={`${d.model} · firmware ${d.firmware}`} />

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Device details</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Serial" value={d.serial} />
            <Row label="Model" value={d.model} />
            <Row label="Firmware" value={d.firmware} />
            <Row label="Registered on" value={d.registeredOn} />
            <Row label="Install date" value={d.installDate ?? "—"} />
            <Row label="Status" value={d.status} />
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Assignment</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Account</label>
              <select className="input">
                <option>Northside Homecare (this account)</option>
                <option>Northside — West Branch</option>
              </select>
            </div>
            <div>
              <label className="label">Patient</label>
              <select className="input" defaultValue={assigned?.id ?? ""}>
                <option value="">— Unassigned —</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button className="btn-primary">Update</button>
            <p className="text-xs text-slate-500">
              Reassigning records a Release Date for the previous link and a new Install Date — used for refurb / swap scenarios.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-5 mt-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Device functions</h2>
        <button className="btn-danger" onClick={() => setConfirmDeact(true)}><Ban className="w-4 h-4" /> Deactivate device</button>
      </div>

      {confirmDeact && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50" onClick={() => setConfirmDeact(false)}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900">Deactivate device</h2>
            <p className="text-sm text-red-700 mt-2 bg-red-50 rounded-lg p-3">
              All patient associations are lost when a device is deactivated. The record is retained for audit purposes.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setConfirmDeact(false)}>Cancel</button>
              <button className="btn-danger" onClick={() => setConfirmDeact(false)}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-slate-100 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium text-right">{value}</dd>
    </div>
  );
}
