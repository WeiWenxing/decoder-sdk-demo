import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SDK Test Demo",
  description: "Test qxan-decoder-sdk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
