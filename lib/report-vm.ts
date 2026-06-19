import type { ComplianceReportResult, ReportBySessionResult } from "./types.api";

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
  };
}

// End User reportBySession -> VM
export function fromReportBySessionResult(r: ReportBySessionResult, ctx: ReportCtx = {}): ReportVM {
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
      datesOfReport: r.datesOfReport,
      daysUsed: r.usage,
      totalDays: r.numberOfDays,
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
