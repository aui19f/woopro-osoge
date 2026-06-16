import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleFromUser, ROLE_DASHBOARDS } from "@/middleware.utils";

export default async function RootPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = getRoleFromUser(user);
  const destination = role ? ROLE_DASHBOARDS[role] : "/login";
  redirect(destination);
}
