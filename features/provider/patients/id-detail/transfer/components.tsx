import UiButton from "@/components/ui/Button";
export function DestRow({
  selected,
  onClick,
  title,
  tag,
  tagClass,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  tag: string;
  tagClass: string;
  desc: string;
}) {
  return (
    <UiButton
      variant="plain"
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-4 transition flex items-start gap-3 ${
        selected
          ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/30"
          : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${selected ? "border-brand-600 bg-brand-600" : "border-slate-300"}`}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{title}</span>
          <span className={`badge ${tagClass}`}>{tag}</span>
        </div>
        <p className="text-sm text-slate-600 mt-0.5">{desc}</p>
      </div>
    </UiButton>
  );
}
