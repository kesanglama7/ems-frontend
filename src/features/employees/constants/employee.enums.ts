export const workModeItems = [
  {
    label: "On Field",
    value: "ON_FIELD",
  },
  {
    label: "Remote",
    value: "REMOTE",
  },
] as const;

export const WORK_MODE_LABELS: Record<typeof workModeItems[number]["value"], string> = {
  ON_FIELD: "On Field",
  REMOTE: "Remote",
};