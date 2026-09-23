import type { Metadata } from "next";
import { AuthFrame } from "@/components/admin/AuthFrame";
import { NoAccess } from "@/components/admin/NoAccess";

export const metadata: Metadata = { title: "No access" };

export default function NoAccessPage() {
  return (
    <AuthFrame>
      <NoAccess />
    </AuthFrame>
  );
}
