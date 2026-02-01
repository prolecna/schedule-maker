import ChooseSchool from "./ChooseSchool";
import { redirect } from "next/navigation";
import { UserService } from "@/services/user-service";
import { navItems } from "@/components/navigation-sidebar/nav-items";

export default async function ChooseSchoolPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentUser = await UserService.getCurrentUser();

  if (!currentUser) {
    redirect("/auth/complete-profile");
  }

  if (currentUser && currentUser.schools.length === 1) {
    await UserService.updateUserActiveSchool(currentUser.schools[0].id);

    const queryParams = await searchParams;
    const redirectParam = queryParams?.redirect;
    const validRedirectUrls = navItems.map((item) => item.href);
    let redirectUrl = "/schedule";
    if (typeof redirectParam === "string" && validRedirectUrls.includes(redirectParam)) {
      redirectUrl = redirectParam;
    }

    redirect(redirectUrl);
  }

  return <ChooseSchool user={currentUser} />;
}
