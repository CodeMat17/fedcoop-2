import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthFrame } from "@/components/admin/AuthFrame";

export const metadata: Metadata = { title: "Create account" };

/* An account alone grants nothing: an admin must give it the role (Users screen). */
export default function AdminSignUp() {
  return (
    <AuthFrame>
      <SignUp path="/admin/sign-up" signInUrl="/admin/sign-in" fallbackRedirectUrl="/admin" />
    </AuthFrame>
  );
}
