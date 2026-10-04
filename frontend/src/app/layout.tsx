import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PunchCode",
  description: "A retro IBM 029 punch-card programming challenge",
  icons: {
    icon: "/Logo.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#181a1d] text-[#c5cfd6] antialiased">
        {children}
      </body>
    </html>
  );
}