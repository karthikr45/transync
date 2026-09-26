export function Field({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type="number" defaultValue={value} />
    </div>
  );
}

export function ModalField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
