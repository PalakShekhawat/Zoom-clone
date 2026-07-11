import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Zoom Clone",
  description: "A Zoom-style video conferencing dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#F7F9FA] text-[#1A1A1A]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
