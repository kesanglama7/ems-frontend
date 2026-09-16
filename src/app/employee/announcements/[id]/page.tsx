import { EmployeeAnnouncementDetail } from "@/features/announcements/components/employee/announcement-detail";
export default async function AnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeeAnnouncementDetail id={id} />;
}
