export interface OfficeSetting {
  id: string;
  officeName: string;
  timezone: string;
  workStartTime: string;
  workEndTime: string;
  workingDays: string[];
  gracePeriodMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export type UpdateOfficeSettingPayload = Partial<
  Pick<
    OfficeSetting,
    | "officeName"
    | "timezone"
    | "workStartTime"
    | "workEndTime"
    | "workingDays"
    | "gracePeriodMinutes"
  >
>;

export const WORKING_DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

export type WorkingDay = (typeof WORKING_DAYS)[number];

export const WORKING_DAY_LABELS: Record<WorkingDay, string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

export interface TimezoneOption {
  label: string;
  value: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { label: "Nepal (UTC+5:45)", value: "Asia/Kathmandu" },
  { label: "India (UTC+5:30)", value: "Asia/Kolkata" },
  { label: "Bangladesh (UTC+6:00)", value: "Asia/Dhaka" },
  { label: "Sri Lanka (UTC+5:30)", value: "Asia/Colombo" },
  { label: "Pakistan (UTC+5:00)", value: "Asia/Karachi" },
  { label: "Bhutan (UTC+6:00)", value: "Asia/Thimphu" },
  { label: "Myanmar (UTC+6:30)", value: "Asia/Yangon" },
  { label: "Singapore (UTC+8:00)", value: "Asia/Singapore" },
  { label: "Malaysia (UTC+8:00)", value: "Asia/Kuala_Lumpur" },
  { label: "Philippines (UTC+8:00)", value: "Asia/Manila" },
  { label: "Thailand (UTC+7:00)", value: "Asia/Bangkok" },
  { label: "Vietnam (UTC+7:00)", value: "Asia/Ho_Chi_Minh" },
  { label: "Indonesia — Jakarta (UTC+7:00)", value: "Asia/Jakarta" },
  { label: "Indonesia — Bali (UTC+8:00)", value: "Asia/Makassar" },
  { label: "China (UTC+8:00)", value: "Asia/Shanghai" },
  { label: "Japan (UTC+9:00)", value: "Asia/Tokyo" },
  { label: "South Korea (UTC+9:00)", value: "Asia/Seoul" },
  { label: "Australia — Sydney (UTC+10/+11)", value: "Australia/Sydney" },
  { label: "New Zealand (UTC+12/+13)", value: "Pacific/Auckland" },
  { label: "United Kingdom (UTC+0/+1)", value: "Europe/London" },
  { label: "Germany (UTC+1/+2)", value: "Europe/Berlin" },
  { label: "France (UTC+1/+2)", value: "Europe/Paris" },
  { label: "United States — Eastern (UTC-5/-4)", value: "America/New_York" },
  { label: "United States — Central (UTC-6/-5)", value: "America/Chicago" },
  { label: "United States — Mountain (UTC-7/-6)", value: "America/Denver" },
  { label: "United States — Pacific (UTC-8/-7)", value: "America/Los_Angeles" },
  { label: "Canada — Toronto (UTC-5/-4)", value: "America/Toronto" },
  { label: "UAE (UTC+4:00)", value: "Asia/Dubai" },
  { label: "Saudi Arabia (UTC+3:00)", value: "Asia/Riyadh" },
  { label: "South Africa (UTC+2:00)", value: "Africa/Johannesburg" },
];

// 30-minute interval time options from 00:00 to 23:30
export const TIME_OPTIONS: TimezoneOption[] = Array.from(
  { length: 48 },
  (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, "0");
    const m = (i % 2 === 0 ? "00" : "30");
    const value = `${h}:${m}`;
    const hour12 = i / 2;
    const suffix = hour12 >= 12 ? "PM" : "AM";
    const displayHour = hour12 === 0 ? 12 : hour12 > 12 ? hour12 - 12 : hour12;
    const label = `${displayHour}:${m} ${suffix}`;
    return { label, value };
  },
);
