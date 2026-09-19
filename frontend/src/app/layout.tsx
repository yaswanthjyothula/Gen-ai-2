import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRIMENET-X | AI Criminal Network Intelligence Platform",
  description: "Transform authorised investigative data into explainable temporal network intelligence that helps investigators discover relationships, communities, anomalies, and cross-case connections while maintaining evidence provenance and human oversight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
