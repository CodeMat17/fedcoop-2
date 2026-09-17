import { redirect } from "next/navigation";

/** Placeholder until the Convex Auth-backed CMS (§17) is connected. */
export default function AdminIndex() {
  redirect("/admin/sign-in");
}
