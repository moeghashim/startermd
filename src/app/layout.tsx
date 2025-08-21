import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STARTER.md - AI Development Workflow Files Generator",
  description: "Generate essential markdown files for AI development workflows: AGENTS.md, PRD templates, task generators, and more.",
  keywords: ["AI development", "AGENTS.md", "PRD templates", "task management", "development workflow"],
  authors: [{ name: "STARTER.md" }],
  openGraph: {
    title: "STARTER.md - AI Development Workflow Files Generator",
    description: "Generate essential markdown files for AI development workflows",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
