import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mahmoud ABD ELKream — Front-End Developer & Product Designer",
  description:
    "From Figma to shipped React — award-winning product design for healthcare and e-commerce. Portfolio of Mahmoud ABD ELKream, Alexandria, Egypt.",
  keywords: [
    "Mahmoud ABD ELKream",
    "Front-End Developer",
    "Product Designer",
    "React",
    "UI/UX",
    "Portfolio",
    "Healthcare",
    "E-commerce",
    "Alexandria",
    "Egypt",
  ],
  authors: [{ name: "Mahmoud ABD ELKream" }],
  icons: {
    icon: "/favicon.svg",
  },
  metadataBase: new URL("https://mahmoud-ahmed-abdelkream.vercel.app"),
  openGraph: {
    title: "Mahmoud ABD ELKream — Portfolio",
    description:
      "From Figma to shipped React — award-winning product design for healthcare and e-commerce. iSchool 1st Place 2025, IEEE YESIST international finalist.",
    type: "website",
    url: "https://mahmoud-ahmed-abdelkream.vercel.app",
    siteName: "Mahmoud ABD ELKream — Portfolio",
    images: [
      {
        url: "/images/portfolio-mockup-laptop 3.png",
        width: 1200,
        height: 630,
        alt: "Medoniq — Digital Healthcare Platform by Mahmoud ABD ELKream",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahmoud ABD ELKream — Portfolio",
    description:
      "From Figma to shipped React — award-winning product design for healthcare and e-commerce.",
    images: ["/images/portfolio-mockup-laptop 3.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#0a1628", color: "#e8f0f8" }}
      >
        <SiteNav />

        {/* Page content */}
        <main style={{ minHeight: "calc(100vh - 140px)" }}>{children}</main>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid rgba(77, 168, 218, 0.25)",
            padding: "2.5rem 1.5rem",
            background: "#0a1628",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              gap: "2rem",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  marginBottom: "0.4rem",
                }}
              >
                Mahmoud ABD ELKream
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#7a9bb8",
                  maxWidth: "360px",
                  lineHeight: 1.5,
                }}
              >
                Front-End Developer &amp; Product Designer. Building intuitive
                digital experiences for healthcare, e-commerce, and beyond.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                fontSize: "0.88rem",
              }}
            >
              <Link
                href="/contact"
                style={{ color: "#4da8da", textDecoration: "none" }}
              >
                Contact me
              </Link>
              <a
                href="mailto:mahmoudabdelkreambusiness@gmail.com"
                style={{ color: "#7a9bb8", textDecoration: "none" }}
              >
                mahmoudabdelkreambusiness@gmail.com
              </a>
              <a
                href="https://github.com/Mahmoud-ABDALKream"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#7a9bb8", textDecoration: "none" }}
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/mahmoud-abd-elkream/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#7a9bb8", textDecoration: "none" }}
              >
                LinkedIn
              </a>
            </div>
            {/* FlyRank Graduate Badge */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <a
                href="https://aifluency.flyrank.ai"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.4rem 0.85rem",
                  background: "rgba(77, 168, 218, 0.12)",
                  border: "1px solid rgba(77, 168, 218, 0.4)",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  color: "#4da8da",
                  fontWeight: 600,
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                }}
              >
                <span style={{ fontSize: "0.9rem" }}>&#x1F39F;</span>
                FlyRank Graduate
              </a>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "#5a7a96",
                  textAlign: "center",
                }}
              >
                AI Fluency Program
              </p>
            </div>
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "2rem",
              fontSize: "0.78rem",
              color: "#5a7a96",
              letterSpacing: "0.05em",
            }}
          >
            © 2026 Mahmoud ABD ELKream · Built with Next.js, React, and Tailwind
            CSS · Alexandria, Egypt
          </p>
        </footer>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
