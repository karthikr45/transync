"use client";

import { useMemo } from "react";

import { listCountries } from "@/lib/countries";
import { listTimeZones } from "@/lib/timezone";

export function useOrganizationSettingsModel() {
  const countries = useMemo(() => listCountries(), []);
  const timeZones = useMemo(() => listTimeZones(), []);
  return { countries, timeZones };
}
