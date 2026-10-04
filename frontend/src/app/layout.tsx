import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IBM 029 Keypunch Workstation",
  description: "Electromechanical 80-Column Card Punch Workstation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#181a1d] text-[#c5cfd6] antialiased">
        {/* Soft overhead vignette - replaces blinding white glare with dark room atmosphere */}
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)] z-40" />
        {children}
      </body>
    </html>
  );
}