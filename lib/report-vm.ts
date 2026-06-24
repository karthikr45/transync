import type { ComplianceReportResult, ParameterResult, ReportBySessionResult } from "./types.api";

const firstNumber = (...candidates: (number | null | undefined)[]): number | null | undefined => {
  for (const c of candidates) if (c !== null && c !== undefined) return c;
  return undefined;
};
const firstString = (...candidates: (string | null | undefined)[]): string | null | undefined => {
  for (const c of candidates) if (c) return c;
  return undefined;
};
const firstBool = (...candidates: (boolean | null | undefined)[]): boolean | null | undefined => {
  for (const c of candidates) if (c !== null && c !== undefined) return c;
  return undefined;
};

/**
 * Map a /parameter/getByEmailAndDeviceId response onto the report
 * VM's patientSettings block. Today's API returns minimumPressure /
 * maximumPressure / startingPressure / startingRampPressure /
 * rampDuration / EZEX; the legacy aliases are kept as fallbacks so
 * older firmware still wires up correctly. First non-null match wins,
 * falling back to whatever was already on the VM.
 */
export function mergeParameterIntoVM(vm: ReportVM, p: ParameterResult | null | undefined): ReportVM {
  if (!p) return vm;
  const existing = vm.patientSettings;
  return {
    ...vm,
    patientSettings: {
      startingPressure: firstNumber(p.startingPressure, p.rampStartPressure, existing.startingPressure) ?? null,
      minPressure: firstNumber(p.minimumPressure, p.minPressure, p.pressureMin, p.therapyPressureMin, existing.minPressure) ?? null,
      maxPressure: firstNumber(p.maximumPressure, p.maxPressure, p.pressureMax, p.therapyPressureMax, existing.maxPressure) ?? null,
      gentleRisePressure: firstNumber(p.startingRampPressure, p.gentleRisePressure, p.rampStartPressure, existing.gentleRisePressure) ?? null,
      gentleRiseDuration: firstNumber(p.rampDuration, p.gentleRiseDuration, p.ramp, p.rampTime, existing.gentleRiseDuration) ?? null,
      airRelief: firstNumber(p.EZEX, p.airRelief, p.comfortControlPlusLevel, existing.airRelief) ?? null,
      mode: firstString(p.mode, existing.mode) ?? null,
      tubingType: firstString(p.tubingType, existing.tubingType) ?? null,
      heatedHumidifier: firstBool(p.heatedHumidifier, existing.heatedHumidifier) ?? null,
      heatedTube: firstBool(p.heatedTube, existing.heatedTube) ?? null,
    },
  };
}

export type ReportVM = {
  patientDetails: {
    name?: string;
    deviceSerial?: string;
    email?: string;
    provider?: string;
  };
  patientSettings: {
    startingPressure?: number | null;
    minPressure?: number | null;
    maxPressure?: number | null;
    gentleRisePressure?: number | null;
    gentleRiseDuration?: number | null; // minutes
    airRelief?: number | null;
    mode?: string | null;
    tubingType?: string | null;
    heatedHumidifier?: boolean | null;
    heatedTube?: boolean | null;
  };
  usage: {
    lastSyncDate?: string;
    datesOfReport?: string;
    daysUsed?: number;
    totalDays?: number;
    averageHoursPerNight?: number;
    fourPlusUsage?: number;
    sixPlusUsage?: number;
    notUsed?: number;
  };
  ahi: {
    ahiIndex?: number;
    apneaIndex?: number;
    hypopneaIndex?: number;
    centralApneaIndex?: number | null;
    centralHypopneaIndex?: number | null;
    totalApneaDuration?: number;
    percentTimeInApnea?: number;
    longestApnea?: number;
    averageApneaDuration?: number;
    flowLtdIndex?: number;
    snoreIndex?: number;
  };
  leak: {
    averageLeak?: number;
    p95Leak?: number;
    maxLeak?: number | null;
    leakLimitExceedance?: number | null;
    leakAvgRange?: number;
  };
  pressure: {
    minPressure?: number;
    maxPressure?: number;
    averagePressure?: number;
    p95Pressure?: number;
    p90Pressure?: number | null;
  };
  sleep?: { sleepScore?: number; avgMaskRemoved?: number };
  // Raw device settings (1:1 mapping of the Home Care compliance-report
  // DeviceSettingsMetrics block, for the Advanced tab).
  deviceSettings?: {
    mode?: string | null;
    ramp?: number | null;
    therapyPressure?: { min: number; max: number } | null;
    rampStartPressure?: number | null;
    comfortControlPlusLevel?: number | null;
    tubingType?: string | null;
    heatedHumidifier?: boolean | null;
    heatedTube?: boolean | null;
    maskLeak?: number | null;
    analysisParameter?: string | null;
  };
};

export type ReportCtx = {
  name?: string;
  email?: string;
  deviceSerial?: string;
  provider?: string;
  lastSyncDate?: string;
  datesOfReportOverride?: string;
  totalDaysOverride?: number;
};

// Home Care compliance-report -> VM
export function fromComplianceReportResult(r: ComplianceReportResult, ctx: ReportCtx = {}): ReportVM {
  const total = ctx.totalDaysOverride ?? r.HeaderMetrics?.daysFromTo;
  return {
    patientDetails: {
      name: r.HeaderMetrics?.name || ctx.name,
      email: ctx.email,
      deviceSerial: ctx.deviceSerial,
      provider: ctx.provider,
    },
    patientSettings: {
      startingPressure: r.DeviceSettingsMetrics.rampStartPressure,
      minPressure: r.DeviceSettingsMetrics.therapyPressure?.min ?? null,
      maxPressure: r.DeviceSettingsMetrics.therapyPressure?.max ?? null,
      gentleRisePressure: r.DeviceSettingsMetrics.rampStartPressure,
      gentleRiseDuration: r.DeviceSettingsMetrics.ramp,
      airRelief: r.DeviceSettingsMetrics.comfortControlPlusLevel,
      mode: r.DeviceSettingsMetrics.mode,
      tubingType: r.DeviceSettingsMetrics.tubingType,
      heatedHumidifier: r.DeviceSettingsMetrics.heatedHumidifier,
      heatedTube: r.DeviceSettingsMetrics.heatedTube,
    },
    usage: {
      lastSyncDate: ctx.lastSyncDate,
      datesOfReport: ctx.datesOfReportOverride,
      daysUsed: r.UsageMetrics.daysUsed ?? undefined,
      totalDays: total,
      averageHoursPerNight: r.UsageMetrics.averageUsageTimePerUsedDays ?? r.AnalysisSummaryMetrics.averageUsageTime ?? undefined,
      fourPlusUsage: r.UsageMetrics.daysUsedOver4Hours ?? undefined,
      sixPlusUsage: undefined, // not exposed by this API
      notUsed: r.UsageMetrics.daysNotUsed ?? undefined,
    },
    ahi: {
      ahiIndex: r.AhiMetrics.ahi ?? undefined,
      apneaIndex: r.AhiMetrics.obstructiveApneas ?? undefined,
      hypopneaIndex: r.AhiMetrics.obstructiveHypopneas ?? undefined,
      centralApneaIndex: r.BreathingEventMetrics.centralApneas,
      centralHypopneaIndex: r.BreathingEventMetrics.centralHypopneas,
      averageApneaDuration: r.BreathingEventMetrics.averageApneaDuration ?? undefined,
      flowLtdIndex: r.BreathingEventMetrics.ifl ?? undefined,
      snoreIndex: r.BreathingEventMetrics.snoring ?? undefined,
    },
    leak: {
      averageLeak: r.LeakMetrics.averageLeak ?? undefined,
      p95Leak: r.LeakMetrics.p90Leak ?? undefined,
      maxLeak: r.LeakMetrics.maxLeak,
      leakLimitExceedance: r.LeakMetrics.leakLimitExceedance,
    },
    pressure: {
      minPressure: r.DeviceSettingsMetrics.therapyPressure?.min ?? undefined,
      maxPressure: r.PressureMetrics.maxPressure ?? r.DeviceSettingsMetrics.therapyPressure?.max ?? undefined,
      averagePressure: r.PressureMetrics.averagePressure ?? undefined,
      p90Pressure: r.PressureMetrics.p90Pressure,
    },
    deviceSettings: {
      mode: r.DeviceSettingsMetrics.mode,
      ramp: r.DeviceSettingsMetrics.ramp,
      therapyPressure: r.DeviceSettingsMetrics.therapyPressure,
      rampStartPressure: r.DeviceSettingsMetrics.rampStartPressure,
      comfortControlPlusLevel: r.DeviceSettingsMetrics.comfortControlPlusLevel,
      tubingType: r.DeviceSettingsMetrics.tubingType,
      heatedHumidifier: r.DeviceSettingsMetrics.heatedHumidifier,
      heatedTube: r.DeviceSettingsMetrics.heatedTube,
      maskLeak: r.DeviceSettingsMetrics.maskLeak,
      analysisParameter: r.DeviceSettingsMetrics.analysisParameter,
    },
  };
}

// End User reportBySession -> VM
export function fromReportBySessionResult(r: ReportBySessionResult, ctx: ReportCtx = {}): ReportVM {
  // r.numberOfDays is the API's data window (number of days actually
  // covered by stored events); ctx.totalDaysOverride is the window the
  // user asked for ("90 Days" -> 90, custom span -> day count). Prefer
  // the override so percentages and "X of Y days" rows render against
  // the user-picked window, falling back to numberOfDays when callers
  // don't supply an override.
  const totalDays = ctx.totalDaysOverride ?? r.numberOfDays;
  // r.usage is total therapy hours in this API version, not the
  // count of days used. Derive days-used from numberOfDays - notUsed
  // (mobile renders the same way for the 1-of-1-day case).
  const daysUsed = Math.max(0, (r.numberOfDays ?? 0) - (r.notUsed ?? 0));
  return {
    patientDetails: {
      name: ctx.name,
      email: ctx.email,
      deviceSerial: ctx.deviceSerial,
      provider: ctx.provider,
    },
    patientSettings: {},
    usage: {
      lastSyncDate: ctx.lastSyncDate,
      datesOfReport: ctx.datesOfReportOverride ?? r.datesOfReport,
      daysUsed,
      totalDays,
      notUsed: r.notUsed,
      averageHoursPerNight: r.averageHoursPerNight,
      fourPlusUsage: r.greaterThanFour,
      sixPlusUsage: r.greaterThanSix,
    },
    ahi: {
      ahiIndex: r.AHI,
      apneaIndex: r.apnea,
      hypopneaIndex: r.hypopnea,
      totalApneaDuration: r.apneaDuration,
      percentTimeInApnea: r.apneaPercentage,
      longestApnea: r.longestApnea,
      averageApneaDuration: r.apneaAvgLength,
      flowLtdIndex: r.flowLtdIndex,
      snoreIndex: r.snoreIndex,
    },
    leak: {
      averageLeak: r.averageLeak,
      p95Leak: r.ninetyFivePercentileLeak,
      leakAvgRange: r.leakAvgRange,
    },
    pressure: {
      minPressure: r.minPressure,
      maxPressure: r.maxPressure,
      averagePressure: r.averagePressure,
      p95Pressure: r.ninetyFivePercentilePressure,
    },
    sleep: { sleepScore: r.sleepScore, avgMaskRemoved: r.avgMaskRemoved },
  };
}
