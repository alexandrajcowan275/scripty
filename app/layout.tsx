import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canon — Continuity memory",
  description: "Continuity memory and monitoring for AI-generated stories.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
