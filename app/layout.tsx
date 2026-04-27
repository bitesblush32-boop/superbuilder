import type { Metadata } from "next";
import {
  Bebas_Neue,
  Exo_2,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
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
  metadataBase: new URL("https://www.superbuilder.org"),
  title: {
    default:  "Super Builders — AI Hackathon for School Students | zer0.pro",
    template: "%s | Super Builders",
  },
  description:
    "India's biggest AI hackathon for school students (Class 8–12). 3-week programme + 24-hour build sprint. ₹1,00,000+ prize pool. Register before May 30, 2026.",
  icons: {
    icon:        [
      { url: "/favicon.ico",                sizes: "any" },
      { url: "/icon.svg",   type: "image/svg+xml" },
    ],
    apple:       "/apple-touch-icon.png",
    shortcut:    "/favicon.ico",
  },
  manifest: "/site.webmanifest",
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
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>{children}</ClerkProvider>
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","wi03jcbx8s");`,
          }}
        />
      </body>
    </html>
  );
}
