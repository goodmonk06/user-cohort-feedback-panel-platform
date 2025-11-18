import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Feedback Panel Platform",
  description: "User cohort feedback panel platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
