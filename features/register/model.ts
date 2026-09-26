import { nameForCode } from "@/lib/countries";
export type AccountType = "provider" | "monitor" | "individual";

export type Form = {
  firstName: string;
  lastName: string;
  title: string;
  userName: string;
  email: string;
  confirmEmail: string;
  timeZone: string;
  address1: string;
  address2: string;
  city: string;
  country: string; // human-readable name sent to the API (e.g. "United States")
  countryCode: string; // ISO alpha-2 used to drive the state dropdown
  stateProvince: string;
  postalCode: string;
  phone: string;
  companyName: string;
  accountNumber: string;
  uniqueIdentifier: string;
  institutionName: string;
  password: string;
  confirmPassword: string;
};

export const blank: Form = {
  firstName: "",
  lastName: "",
  title: "",
  userName: "",
  email: "",
  confirmEmail: "",
  timeZone: "",
  address1: "",
  address2: "",
  city: "",
  country: nameForCode("US"),
  countryCode: "US",
  stateProvince: "",
  postalCode: "",
  phone: "",
  companyName: "",
  accountNumber: "",
  uniqueIdentifier: "",
  institutionName: "",
  password: "",
  confirmPassword: "",
};

export type DetailsProps = {
  form: Form;
  update: <K extends keyof Form>(k: K, v: Form[K]) => void;
  fieldErrors?: Record<string, string[]>;
};

export function selectCountry(update: DetailsProps["update"], code: string) {
  update("countryCode", code);
  update("country", nameForCode(code));
  update("stateProvince", "");
}
