import Image from "next/image";
import Link from "next/link";
import { HoverLink, HoverCard } from "@/components/interactive";

export default function Work() {
  return (
    <div style={{ background: "#0a1628" }}>
      {/* Header */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "4rem 1.5rem 2rem",
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
          Featured Projects
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "1rem",
          }}
        >
          Work
        </h1>
        <p
          style={{
            fontSize: "1.05rem",
            color: "#7a9bb8",
            maxWidth: "640px",
            lineHeight: 1.6,
          }}
        >
          A curated selection of my UI/UX design and web development work
          showcasing creativity and technical expertise.
        </p>
      </section>

      {/* Lead case — Medoniq full-width */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "2rem auto 0",
          padding: "0 1.5rem",
        }}
      >
        <HoverLink
          href="/work/medoniq"
          baseStyle={{
            display: "block",
            background: "rgba(228, 236, 245, 0.05)",
            border: "1px solid #4da8da",
            borderRadius: "12px",
            overflow: "hidden",
            textDecoration: "none",
            color: "inherit",
          }}
          hoverStyle={{
            borderColor: "#7fd0f0",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                position: "relative",
                minHeight: "320px",
                background: "#142840",
              }}
            >
              <Image
                src="/images/portfolio-mockup-laptop 3.png"
                alt="Medoniq — Digital Healthcare Platform"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div style={{ padding: "2.5rem" }}>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#4da8da",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Lead Case · Healthcare · 2025
              </p>
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  marginBottom: "0.75rem",
                  lineHeight: 1.2,
                }}
              >
                Medoniq — Digital Healthcare Platform
              </h2>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#7a9bb8",
                  lineHeight: 1.6,
                  marginBottom: "1.25rem",
                }}
              >
                Full-stack web + mobile app for family-centered healthcare
                management: medication tracking, secure health records, and
                doctor connectivity. Won the iSchool Startup Teens 2025 1st
                Place + Promising Startup Award.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  marginBottom: "1.5rem",
                }}
              >
                {["React", "Node.js", "Figma", "UI/UX", "Healthcare"].map(
                  (t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "0.75rem",
                        color: "#4da8da",
                        border: "1px solid rgba(77, 168, 218, 0.45)",
                        padding: "0.3rem 0.7rem",
                        borderRadius: "999px",
                      }}
                    >
                      {t}
                    </span>
                  ),
                )}
              </div>
              <span
                style={{
                  fontSize: "0.95rem",
                  color: "#4da8da",
                  fontWeight: 600,
                }}
              >
                Read the case →
              </span>
            </div>
          </div>
        </HoverLink>
      </section>

      {/* Project grid */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "3rem auto 4rem",
          padding: "0 1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "#4da8da",
          }}
        >
          More Projects
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              img: "/images/portfolio-mockup-laptop 2.jpg",
              tag: "Streaming · Development",
              title: "WEflex — Streaming Experience Redefined",
              desc: "Netflix-inspired streaming web platform with cinematic UI, movie browsing, trailers, and smooth hover interactions.",
            },
            {
              img: "/images/Medoniq app.png",
              tag: "Healthcare · Mobile Design",
              title: "Medoniq — Smart Health Companion App",
              desc: "Mobile app UI/UX for family-centered healthcare: medication tracking, secure health records, doctor connectivity.",
            },
            {
              img: "/images/portfolio-mockup-laptop 20.jpg",
              tag: "Wellness · UI/UX",
              title: "HealthTrack — Wellness Companion App",
              desc: "UI/UX design for a digital wellness app combining health tracking, habit monitoring, and fitness coaching with light/dark mode.",
            },
            {
              img: "/images/serinia.png",
              tag: "E-commerce · RTL",
              title: "Serinia — Fashion E-commerce Platform",
              desc: "Modern Arabic RTL fashion e-commerce website with dual-themed design, product filtering, and localized shopping for women and men.",
            },
            {
              img: "/images/Portfolio mockup.png",
              tag: "Event · Design System",
              title: "TEDx Dokki Youth Platform",
              desc: "Complete UI/UX design for the official digital event platform — ticket purchasing, team dashboard, and help center.",
            },
            {
              img: "/images/IEEE EUI SB.png",
              tag: "Leadership · UI/UX",
              title: "IEEE EUI SB — High Board Page",
              desc: "Professional UI/UX design for the IEEE EUI Student Branch leadership showcase: interactive team profiles and org hierarchy.",
            },
          ].map((p) => (
            <HoverCard
              key={p.title}
              baseStyle={{
                background: "rgba(228, 236, 245, 0.05)",
                border: "1px solid rgba(77, 168, 218, 0.2)",
                borderRadius: "10px",
                overflow: "hidden",
              }}
              hoverStyle={{
                borderColor: "#4da8da",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "200px",
                  background: "#142840",
                }}
              >
                <Image
                  src={p.img}
                  alt={p.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div style={{ padding: "1.25rem" }}>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#4da8da",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  {p.tag}
                </p>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    color: "#e8f0f8",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "#7a9bb8",
                    lineHeight: 1.5,
                  }}
                >
                  {p.desc}
                </p>
              </div>
            </HoverCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "3rem 1.5rem 4rem",
          textAlign: "center",
          borderTop: "1px solid rgba(77, 168, 218, 0.15)",
        }}
      >
        <p
          style={{
            fontSize: "1.05rem",
            color: "#7a9bb8",
            marginBottom: "1.5rem",
          }}
        >
          Want the full story behind each project?
        </p>
        <Link
          href="/case-studies"
          style={{
            display: "inline-block",
            padding: "0.85rem 1.75rem",
            border: "1px solid #4da8da",
            color: "#e8f0f8",
            fontWeight: 600,
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.95rem",
          }}
        >
          Read case studies →
        </Link>
      </section>
    </div>
  );
}
