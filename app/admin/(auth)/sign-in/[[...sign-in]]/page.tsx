import type { Metadata } from "next";
import { AuthFrame } from "@/components/admin/AuthFrame";
import { SignInPanel } from "@/components/admin/SignInPanel";

export const metadata: Metadata = { title: "Sign in" };

export default function AdminSignIn() {
  return (
    <AuthFrame>
      <SignInPanel />
    </AuthFrame>
  );
}
