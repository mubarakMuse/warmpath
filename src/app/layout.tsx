import type { Metadata } from "next";
import { DM_Sans, Lora } from "next/font/google";
import { Providers } from "@/app/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Warmpath — Hire through warm intros",
    template: "%s | Warmpath",
  },
  description:
    "One shareable link per role. Collect referrals and applications from people who actually know the candidate—not anonymous job boards.",
  keywords: ["hiring", "referrals", "warm intros", "recruiting", "startups", "connectors"],
  authors: [{ name: "Warmpath" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Warmpath",
    title: "Warmpath — Hire through warm intros",
    description:
      "One link per role. Trusted referrals and structured applications for teams that hire through their network.",
  },
  twitter: {
    card: "summary",
    title: "Warmpath",
    description: "Hire through warm intros. One link per role.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/warmpath-mark.svg", type: "image/svg+xml" }],
    apple: "/warmpath-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
