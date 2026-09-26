export type Step = 1 | 2 | 3 | 4 | 5;

export type Form = {
  // Step 1
  countryCode: string; // ISO alpha-2 ("US"). API sends the full name.
  state: string;
  firstName: string;
  lastName: string;
  email: string;
  // Step 2
  dob: string; // yyyy-MM-dd (input + API)
  occupation: string;
  cpapUser: string;
  transcendUsage: string;
  devicePurchased: string;
  // Step 3
  provider: string;
  providerEmail: string;
  mobile: string; // E.164 ("+14155551234")
  password: string;
  confirmPassword: string;
  consentTerms: boolean;
  consentMarketing: boolean;
};

export const blank: Form = {
  countryCode: "US",
  state: "",
  firstName: "",
  lastName: "",
  email: "",
  dob: "",
  occupation: "",
  cpapUser: "",
  transcendUsage: "",
  devicePurchased: "",
  provider: "",
  providerEmail: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  consentTerms: false,
  consentMarketing: false,
};

export const FALLBACK_OCCUPATIONS = [
  "Other",
  "Engineer",
  "Teacher",
  "Healthcare professional",
  "Driver",
  "Retired",
  "Student",
  "Office / administrative",
];

export const FALLBACK_CPAP_USER = [
  "New User",
  "Less than 1 month",
  "1–3 months",
  "3–6 months",
  "6–12 months",
  "1–3 years",
  "More than 3 years",
];

export const FALLBACK_USAGE = [
  "Business Travel",
  "Personal Travel",
  "Daily Home Use",
  "Backup Device",
  "Camping / Outdoors",
];

export const FALLBACK_PURCHASE = [
  "MyTranscend.com",
  "Local Dealer",
  "Online retailer",
  "Medical equipment supplier",
  "Other",
];

export function friendlyError(raw: string): string {
  const m = (raw || "").toLowerCase();
  if (
    m.includes("argument must be of type") ||
    m.includes("received undefined") ||
    m.includes("buffer")
  ) {
    console.error("[register] backend error:", raw);
    return "We couldn't complete sign-up. Please request a new code and try again.";
  }
  if (m.includes("invalid otp") || m.includes("expired"))
    return "That code is invalid or has expired. Request a new one.";
  if (m.includes("user already exists") || m.includes("already in use"))
    return "An account with this email already exists. Try logging in instead.";
  return raw || "Something went wrong.";
}
