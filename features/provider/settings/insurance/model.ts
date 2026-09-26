import { InsuranceProvider } from "@/lib/mock-data";
export const blank: Omit<InsuranceProvider, "id"> = {
  name: "",
  compliance: { minHoursPerNight: 4, minNightsPercent: 70, windowDays: 30 },
  schedule: {
    maskDays: 90,
    tubeDays: 90,
    filterDays: 30,
    preReminderDays: 7,
    postReminderDays: 14,
    remindersOn: true,
    patientEmailOn: true,
  },
};
