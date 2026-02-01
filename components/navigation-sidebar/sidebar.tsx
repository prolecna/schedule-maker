import SidebarClient from "./sidebar.client";
import { DatabaseService } from "@/services/db-service";

export default async function Sidebar() {
  const currentUser = await DatabaseService.getCurrentUser();
  if (!currentUser) return null;

  return <SidebarClient currentUser={currentUser} />;
}
