import SidebarClient from "./sidebar.client";
import { UserService } from "@/services/user-service";

export default async function Sidebar() {
  const currentUser = await UserService.getCurrentUser();
  if (!currentUser) return null;

  return <SidebarClient currentUser={currentUser} />;
}
