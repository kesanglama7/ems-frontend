import { OfficeSettingsForm } from "@/features/office-settings/components/office-settings-form";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Office Settings</h1>
        <p className="text-muted-foreground">
          Manage your office configuration and working hours.
        </p>
      </div>
      <OfficeSettingsForm />
    </div>
  );
}
