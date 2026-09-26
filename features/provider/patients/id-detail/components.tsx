import UiButton from "@/components/ui/Button";
export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-slate-100 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium text-right">{value}</dd>
    </div>
  );
}

export function Dialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-50"
      onClick={onClose}
    >
      <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function DialogActions({
  onClose,
  confirm,
  danger,
}: {
  onClose: () => void;
  confirm: string;
  danger?: boolean;
}) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <UiButton variant="secondary" type="submit" className="btn-secondary" onClick={onClose}>
        Cancel
      </UiButton>
      <UiButton
        variant="primary"
        type="submit"
        className={danger ? "btn-danger" : "btn-primary"}
        onClick={onClose}
      >
        {confirm}
      </UiButton>
    </div>
  );
}
