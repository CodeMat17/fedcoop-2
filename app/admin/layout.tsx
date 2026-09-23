import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AdminProviders } from "@/components/admin/AdminProviders";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | FEDCOOP admin" },
  robots: { index: false, follow: false },
};

/* Clerk and the Convex client are mounted here, not in the root layout, so no public page loads them. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "var(--cord)",
          colorPrimaryForeground: "var(--paper)",
          colorBackground: "var(--paper-raise)",
          colorForeground: "var(--ink)",
          colorMutedForeground: "var(--ink-muted)",
          colorNeutral: "var(--ink)",
          colorInput: "var(--paper-raise)",
          colorInputForeground: "var(--ink)",
          colorBorder: "var(--cord-line)",
          colorDanger: "var(--danger)",
          fontFamily: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif",
          borderRadius: "0.5rem",
        },
      }}
    >
      <AdminProviders>{children}</AdminProviders>
    </ClerkProvider>
  );
}
