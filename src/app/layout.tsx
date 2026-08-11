import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kudos — Testimonial Collector & Wall of Love",
  description: "Self-hosted, white-label ready testimonial collector. Collect text & video testimonials and embed a beautiful Wall of Love.",
  keywords: ["testimonials", "wall of love", "video testimonials", "social proof", "white label"],
  authors: [{ name: "Kudos" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Kudos — Testimonial Collector & Wall of Love",
    description: "Collect text & video testimonials and embed a beautiful Wall of Love",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kudos — Testimonial Collector & Wall of Love",
    description: "Collect text & video testimonials and embed a beautiful Wall of Love",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
