"use client";

import Link from "next/link";
import { useState, ReactNode, CSSProperties } from "react";

type HoverLinkProps = {
  href: string;
  children: ReactNode;
  baseStyle: CSSProperties;
  hoverStyle: CSSProperties;
  className?: string;
};

/**
 * A Link that swaps inline styles on hover.
 * Client component because onMouseEnter/onMouseLeave require it.
 */
export function HoverLink({
  href,
  children,
  baseStyle,
  hoverStyle,
  className,
}: HoverLinkProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      className={className}
      style={hovered ? { ...baseStyle, ...hoverStyle } : baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}

type HoverCardProps = {
  children: ReactNode;
  baseStyle: CSSProperties;
  hoverStyle: CSSProperties;
  className?: string;
};

/**
 * A div that swaps inline styles on hover.
 * Client component because onMouseEnter/onMouseLeave require it.
 */
export function HoverCard({
  children,
  baseStyle,
  hoverStyle,
  className,
}: HoverCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={className}
      style={hovered ? { ...baseStyle, ...hoverStyle } : baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}
