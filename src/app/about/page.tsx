import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <div style={{ background: "#0a1628" }}>
      {/* Hero */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "4rem 1.5rem 2rem",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "3rem",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "240px",
            height: "300px",
            borderRadius: "10px",
            overflow: "hidden",
            border: "2px solid #4da8da",
            flexShrink: 0,
          }}
        >
          <Image
            src="/images/Mahmoud ABD ELKream-Photoroom.png"
            alt="Mahmoud ABD ELKream — real photograph"
            fill
            style={{ objectFit: "cover" }}
            priority
            sizes="240px"
          />
        </div>
        <div>
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
            About Me
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}
          >
            Designer who ships.
            <br />
            Developer who designs.
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              color: "#7a9bb8",
              lineHeight: 1.6,
            }}
          >
            Front-End Developer &amp; Product Designer based in Alexandria,
            Egypt. IT student at Borg El Arab University of Technology.
          </p>
        </div>
      </section>

      {/* Story */}
      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "#4da8da",
          }}
        >
          My Story
        </h2>
        <div
          style={{
            fontSize: "1.02rem",
            lineHeight: 1.75,
            color: "#e8f0f8",
          }}
        >
          <p style={{ marginBottom: "1.25rem" }}>
            I&rsquo;m Mahmoud ABD ELKream, an IT student at Borg El Arab
            University of Technology in Alexandria, Egypt. As a passionate
            Front-End Developer and Product Designer, I combine creativity and
            technical expertise to craft seamless digital experiences.
          </p>
          <p style={{ marginBottom: "1.25rem" }}>
            My journey began with freelance work on Upwork and Freelancer.com,
            where I built and designed websites for clients in different
            fields. Over the years, I&rsquo;ve gained hands-on experience
            through internships in Artificial Intelligence and Full-Stack
            Development, along with practical work in WordPress, UI/UX design,
            and React-based applications.
          </p>
          <p style={{ marginBottom: "1.25rem" }}>
            I&rsquo;ve developed several projects that reflect my interests in
            technology and innovation — from smart energy solutions and school
            management systems to data-driven dashboards and interactive web
            apps that improve efficiency and user engagement.
          </p>
          <p>
            I&rsquo;m passionate about using design and code to solve real
            problems, whether in education, healthcare, or business, and
            I&rsquo;m always exploring new ways to make digital products more
            impactful and human-centered.
          </p>
        </div>
      </section>

      {/* Core skills */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: "#4da8da",
          }}
        >
          Core Skills
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {[
            "React",
            "Node.js",
            "Laravel",
            "TypeScript",
            "Tailwind CSS",
            "UI/UX Design",
            "Figma",
            "Next.js",
            "WordPress",
            "Python",
          ].map((s) => (
            <div
              key={s}
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(77, 168, 218, 0.08)",
                border: "1px solid rgba(77, 168, 218, 0.3)",
                borderRadius: "6px",
                textAlign: "center",
                fontSize: "0.95rem",
                fontWeight: 500,
                color: "#e8f0f8",
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* Experience timeline */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "2rem",
            color: "#4da8da",
          }}
        >
          Experience
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {[
            {
              role: "Co-Founder & UI/UX Designer",
              org: "XOperations",
              period: "2025–present",
              desc: "Co-founding a product startup; leading design and front-end decisions.",
            },
            {
              role: "Volunteer UI/UX Designer Lead & Front-End Dev Lead",
              org: "TEDx Dokki Youth",
              period: "Mar 2025 – Aug 2025",
              desc: "Led the UI/UX and front-end for the official TEDx Dokki Youth digital event platform.",
            },
            {
              role: "Volunteer UI/UX Designer & Full-Stack Dev",
              org: "IEEE EUI SB",
              period: "Feb 2025 – Sept 2025",
              desc: "Designed and built the IEEE EUI Student Branch high-board leadership page.",
            },
            {
              role: "Freelance Programmer & Web Developer",
              org: "Upwork",
              period: "Jun 2021 – May 2024",
              desc: "Built websites and web apps for international clients across multiple domains.",
            },
            {
              role: "WordPress Developer",
              org: "Freelancer.com",
              period: "Jan 2022 – Mar 2024",
              desc: "Delivered custom WordPress themes and plugins for small businesses.",
            },
          ].map((x) => (
            <div
              key={x.org + x.period}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(140px, 200px) 1fr",
                gap: "1.5rem",
                padding: "1.25rem 0",
                borderBottom: "1px solid rgba(77, 168, 218, 0.15)",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#4da8da",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  {x.period}
                </p>
                <p style={{ fontSize: "0.78rem", color: "#7a9bb8" }}>
                  {x.org}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "1.02rem",
                    fontWeight: 700,
                    marginBottom: "0.35rem",
                  }}
                >
                  {x.role}
                </p>
                <p
                  style={{
                    fontSize: "0.92rem",
                    color: "#7a9bb8",
                    lineHeight: 1.5,
                  }}
                >
                  {x.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "3rem 1.5rem 4rem",
          textAlign: "center",
        }}
      >
        <Link
          href="/contact"
          style={{
            display: "inline-block",
            padding: "0.9rem 2rem",
            background: "#4da8da",
            color: "#0a1628",
            fontWeight: 700,
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "1rem",
          }}
        >
          Let&rsquo;s work together →
        </Link>
      </section>
    </div>
  );
}
