import PageHeader from "@/components/PageHeader";
import { Mail, Clipboard } from "lucide-react";

export default function InvitePatient() {
  return (
    <>
      <PageHeader
        title="Invite patient"
        subtitle="Add a patient to your roster. They&apos;ll need to confirm consent before you can see their data."
      />

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">By email</h2>
          <div className="space-y-3">
            <div><label className="label">Patient email</label><input className="input" type="email" placeholder="patient@example.com" /></div>
            <div><label className="label">First name</label><input className="input" /></div>
            <div><label className="label">Last name</label><input className="input" /></div>
            <div><label className="label">Note (optional)</label><textarea className="input min-h-[80px]" placeholder="Hi! Please connect your TranSync data so we can monitor your therapy." /></div>
            <button className="btn-primary"><Mail className="w-4 h-4" /> Send invite</button>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">By invite code</h2>
          <p className="text-sm text-slate-600 mb-4">Generate a code to share verbally or in person. Patient enters it in the TranSync app to connect.</p>
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-6 text-center">
            <div className="text-3xl font-mono font-semibold text-slate-900 tracking-widest">7K3-92H</div>
            <div className="text-xs text-slate-500 mt-2">Expires in 24 hours</div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="btn-secondary flex-1"><Clipboard className="w-4 h-4" /> Copy code</button>
            <button className="btn-primary flex-1">Generate new</button>
          </div>
        </div>
      </div>

      <div className="card p-5 mt-5">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Pending invites</h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium py-1">Email</th>
              <th className="text-left font-medium py-1">Sent</th>
              <th className="text-left font-medium py-1">Status</th>
              <th className="text-right font-medium py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="py-2">a.singh@example.com</td>
              <td className="py-2 text-slate-600">2026-05-04</td>
              <td className="py-2"><span className="badge badge-amber">Pending</span></td>
              <td className="py-2 text-right"><button className="btn-secondary">Resend</button></td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="py-2">m.gonzalez@example.com</td>
              <td className="py-2 text-slate-600">2026-05-02</td>
              <td className="py-2"><span className="badge badge-amber">Pending</span></td>
              <td className="py-2 text-right"><button className="btn-secondary">Resend</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
