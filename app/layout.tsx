import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocabulary Notebook",
  description: "Build your vocabulary, one word at a time. A simple place to collect words and definitions.",
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
