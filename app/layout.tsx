import type { Metadata } from "next";
import { ApplicationProviders } from "@/components/ui-v2/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scripty — Your AI script supervisor",
  description:
    "Your AI script supervisor. Catch continuity drift across generated shots and turn creator corrections into project memory.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><ApplicationProviders>{children}</ApplicationProviders></body>
    </html>
  );
}
