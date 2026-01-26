import "./globals.css";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Boundary Insights - IPL Data Platform",
  description: "Analytics and insights for IPL matches, teams, and players."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen bg-[#F7F9F8] font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
