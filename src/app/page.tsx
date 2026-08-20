import Link from "next/link";
import Image from "next/image";
import { HoverLink, HoverCard } from "@/components/interactive";

export default function Home() {
  return (
    <div style={{ background: "#0a1628" }}>
      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          padding: "3.5rem 1.5rem 2rem",
          overflow: "hidden",
        }}
      >
        {/* Background hero texture (AI tissue keeper from W3) — reduced opacity so it recedes */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            opacity: 0.18,
          }}
        >
          <Image
            src="/images/hero_A_keeper.png"
            alt=""
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        {/* Dark overlay for text legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(180deg, rgba(10,22,40,0.7) 0%, rgba(10,22,40,0.92) 70%, #0a1628 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "820px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.72rem",
              color: "#4da8da",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontWeight: 500,
              marginBottom: "1rem",
            }}
          >
            Available for freelance &amp; full-time work
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 5.5vw, 3.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
              marginBottom: "1.25rem",
            }}
          >
            Mahmoud
            <br />
            ABD ELKream
          </h1>
          <p
            style={{
              fontSize: "clamp(1.05rem, 2.2vw, 1.45rem)",
              lineHeight: 1.5,
              color: "#e8f0f8",
              maxWidth: "720px",
              margin: "0 auto 2rem",
              fontWeight: 500,
            }}
          >
            From Figma to shipped React — award-winning product design for
            healthcare and e-commerce.
          </p>
          <p
            style={{
              fontSize: "1rem",
              color: "#a0bcd4",
              marginBottom: "1.5rem",
              fontWeight: 400,
            }}
          >
            Front-End Developer &amp; Product Designer · Alexandria, Egypt
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/scout"
              style={{
                display: "inline-block",
                padding: "0.85rem 1.75rem",
                background: "#4da8da",
                color: "#0a1628",
                fontWeight: 700,
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "background 0.15s",
              }}
            >
              Open Research Scout →
            </Link>
            <Link
              href="/work/medoniq"
              style={{
                display: "inline-block",
                padding: "0.85rem 1.75rem",
                border: "1px solid #4da8da",
                color: "#e8f0f8",
                fontWeight: 500,
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "background 0.15s",
              }}
            >
              View Medoniq case →
            </Link>
            <Link
              href="/contact"
              style={{
                display: "inline-block",
                padding: "0.85rem 1.75rem",
                border: "1px solid #4da8da",
                color: "#e8f0f8",
                fontWeight: 500,
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "background 0.15s",
              }}
            >
              Contact me
            </Link>
          </div>
        </div>
      </section>

      {/* ── Research Scout ── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem 2.5rem",
        }}
      >
        <HoverLink
          href="/scout"
          baseStyle={{
            display: "block",
            background: "rgba(77, 168, 218, 0.08)",
            border: "1px solid rgba(77, 168, 218, 0.35)",
            borderRadius: "12px",
            padding: "1.35rem 1.5rem",
            textDecoration: "none",
            color: "inherit",
          }}
          hoverStyle={{
            borderColor: "#4da8da",
            transform: "translateY(-2px)",
          }}
        >
          <p
            style={{
              fontSize: "0.72rem",
              color: "#4da8da",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: "0.45rem",
            }}
          >
            Live agent
          </p>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.4rem" }}>
            Research Scout is running on this site
          </h2>
          <p style={{ color: "#a0bcd4", fontSize: "0.95rem", lineHeight: 1.55 }}>
            GATHER → READ → SCORE → FILTER → FORMAT. Pre-qualifies healthcare and
            e-commerce roles, writes an audit log, and never auto-applies.
          </p>
        </HoverLink>
      </section>

      {/* ── Featured strip (3 cards) ── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem 3rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.4rem",
          }}
        >
          Featured Work
        </h2>
        <p
          style={{
            fontSize: "0.92rem",
            color: "#a0bcd4",
            marginBottom: "1.75rem",
          }}
        >
          A curated selection of UI/UX design and web development work.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              href: "/work/medoniq",
              img: "/images/portfolio-mockup-laptop 3.png",
              tag: "Healthcare · Lead Case · iSchool 1st Place 2025",
              title: "Medoniq — Digital Healthcare Platform",
              desc: "Full-stack web + mobile app for family health management. iSchool 1st Place + Promising Startup Award 2025.",
            },
            {
              href: "/work",
              img: "/images/serinia.png",
              tag: "E-commerce · Arabic RTL",
              title: "Serinia — Fashion E-commerce Platform",
              desc: "Modern Arabic RTL fashion e-commerce with dual-themed design, product filtering, and localized shopping for women and men.",
            },
            {
              href: "/case-studies",
              img: "/images/Portfolio mockup.png",
              tag: "IoT · Energy · IEEE YESIST Finalist",
              title: "Aqua Flow — Smart Energy Conversion",
              desc: "Converts gasoline generators to solar-hybrid for industrial use. IEEE YESIST international finalist, featured on ON TV.",
            },
          ].map((c) => (
            <HoverLink
              key={c.title}
              href={c.href}
              baseStyle={{
                display: "block",
                background: "rgba(228, 236, 245, 0.05)",
                border: "1px solid rgba(77, 168, 218, 0.2)",
                borderRadius: "10px",
                overflow: "hidden",
                textDecoration: "none",
                color: "inherit",
              }}
              hoverStyle={{
                borderColor: "#4da8da",
                transform: "translateY(-2px)",
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
                  src={c.img}
                  alt={c.title}
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
                  {c.tag}
                </p>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    color: "#e8f0f8",
                  }}
                >
                  {c.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "#7a9bb8",
                    lineHeight: 1.5,
                  }}
                >
                  {c.desc}
                </p>
              </div>
            </HoverLink>
          ))}
        </div>
      </section>

      {/* ── Awards strip ── */}
      <section
        style={{
          background: "rgba(20, 40, 64, 0.4)",
          padding: "4rem 1.5rem",
          borderTop: "1px solid rgba(77, 168, 218, 0.15)",
          borderBottom: "1px solid rgba(77, 168, 218, 0.15)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            Awards &amp; Recognition
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              { award: "1st Place", event: "iSchool Startup Teens 2025", note: "Promising Startup Award (Medoniq)" },
              { award: "Top 1000 Worldwide", event: "IEEE YESIST12 Malaysia 2025", note: "International finalist" },
              { award: "5th in Egypt", event: "IEEE YESIST12 Tunisia 2024", note: "Top 1000 worldwide" },
              { award: "Top 9 in Egypt", event: "ECPC 2023–2025", note: "Competed 3 consecutive years" },
              { award: "National Rep", event: "WorldSkills Egypt 2023–2024", note: "Selected twice" },
              { award: "Finalist", event: "ISEF & ISF 2023–2025", note: "International science fairs" },
            ].map((a) => (
              <div
                key={a.event}
                style={{
                  textAlign: "center",
                  padding: "1.25rem",
                }}
              >
                <p
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "#4da8da",
                    marginBottom: "0.4rem",
                  }}
                >
                  {a.award}
                </p>
                <p
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  {a.event}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#7a9bb8" }}>
                  {a.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About teaser ── */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "4rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          About Me
        </h2>
        <p
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.7,
            color: "#e8f0f8",
            marginBottom: "1.5rem",
          }}
        >
          I&rsquo;m an IT student at Borg El Arab University of Technology in
          Alexandria, Egypt. As a passionate Front-End Developer and Product
          Designer, I combine creativity and technical expertise to craft
          seamless digital experiences. My journey began with freelance work on
          Upwork and Freelancer.com, and has grown through internships in AI
          and Full-Stack Development, plus volunteer UI/UX leadership at TEDx
          Dokki Youth and IEEE EUI SB.
        </p>
        <Link
          href="/about"
          style={{
            display: "inline-block",
            padding: "0.7rem 1.5rem",
            border: "1px solid #4da8da",
            color: "#e8f0f8",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "0.92rem",
            fontWeight: 500,
          }}
        >
          Read full about →
        </Link>
      </section>

      {/* ── Contact CTA ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #142840 0%, #0a1628 100%)",
          padding: "4rem 1.5rem",
          textAlign: "center",
          borderTop: "1px solid rgba(77, 168, 218, 0.25)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            marginBottom: "1rem",
          }}
        >
          Let&rsquo;s work together
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#7a9bb8",
            marginBottom: "2rem",
            maxWidth: "560px",
            margin: "0 auto 2rem",
          }}
        >
          Interested in healthcare solutions, e-commerce projects, and
          innovative digital products. Get in touch.
        </p>
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
          Send a message →
        </Link>
      </section>
    </div>
  );
}
