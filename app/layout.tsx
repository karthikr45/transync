import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TranSync",
  description: "TranSync compliance management for Transcend miniCPAP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
