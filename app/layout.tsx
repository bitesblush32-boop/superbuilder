import type { Metadata } from "next";
import {
  Bebas_Neue,
  Exo_2,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://superbuilders.zer0.pro"),
  title: "Super Builders — AI Hackathon for School Students | zer0.pro",
  description:
    "India's #1 AI programme for Class 8–12 students. 3-week online programme + 24-hour hackathon. ₹1,00,000+ prizes. Register before May 25.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${exo2.variable} ${plusJakarta.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
