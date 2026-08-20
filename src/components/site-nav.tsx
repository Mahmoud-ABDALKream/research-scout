"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/scout", label: "Scout" },
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(10, 22, 40, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(77, 168, 218, 0.25)",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0.9rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 700,
            fontSize: "1.05rem",
            letterSpacing: "-0.01em",
            color: "#e8f0f8",
            textDecoration: "none",
          }}
        >
          Mahmoud <span style={{ color: "#4da8da" }}>ABD ELKream</span>
        </Link>
        <div
          style={{
            display: "flex",
            gap: "1.75rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {navLinks.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontSize: "0.92rem",
                  color: isActive ? "#4da8da" : "#7a9bb8",
                  textDecoration: "none",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
