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

export const metadata: Metadata = {
  title: "Warmpath — Human recruiting in an AI world",
  description:
    "Put people back at the center of hiring. A calmer way to recruit when the world is full of AI noise.",
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
