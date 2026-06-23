"use client";

import dynamic from "next/dynamic";
import "react-phone-number-input/style.css";

// react-phone-number-input is heavy-ish; defer to the client only.
const PhoneInput = dynamic(() => import("react-phone-number-input"), {
  ssr: false,
  loading: () => <input className="input" placeholder="Loading…" disabled />,
});

export default function PhoneInputField({
  value,
  onChange,
  defaultCountry = "US",
}: {
  value: string;
  onChange: (v: string) => void;
  defaultCountry?: string;
}) {
  return (
    <div className="phone-input-shell">
      <PhoneInput
        international
        countryCallingCodeEditable={false}
        defaultCountry={defaultCountry as never}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        className="input"
        placeholder="Enter Mobile Number"
      />
    </div>
  );
}
