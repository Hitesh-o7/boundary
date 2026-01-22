import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Boundary Insights - IPL Data Platform",
  description: "Analytics and insights for IPL matches, teams, and players."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen bg-[#F7F9F8] font-sans">
        {children}
      </body>
    </html>
  );
}
