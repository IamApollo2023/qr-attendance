import { redirect } from "next/navigation";

// Redirect to Life Group as default activities page
export default function ActivitiesPage() {
  redirect("/admin/activities/life-group");
}
