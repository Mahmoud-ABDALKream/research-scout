import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a1628",
        color: "#e8f0f8",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "0.78rem",
          color: "#4da8da",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          fontWeight: 300,
          marginBottom: "1rem",
        }}
      >
        404 — Page Not Found
      </p>
      <h1
        style={{
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: "1.5rem",
        }}
      >
        This page doesn&rsquo;t exist.
      </h1>
      <p
        style={{
          fontSize: "1.05rem",
          color: "#7a9bb8",
          maxWidth: "440px",
          lineHeight: 1.6,
          marginBottom: "2rem",
        }}
      >
        The page you&rsquo;re looking for might have been moved, deleted, or
        never existed. Let&rsquo;s get you back on track.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "0.85rem 2rem",
          background: "#4da8da",
          color: "#0a1628",
          fontWeight: 700,
          borderRadius: "6px",
          textDecoration: "none",
          fontSize: "1rem",
        }}
      >
        Back to home →
      </Link>
    </div>
  );
}
