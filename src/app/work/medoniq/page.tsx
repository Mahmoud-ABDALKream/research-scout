import Image from "next/image";
import Link from "next/link";

export default function MedoniqCase() {
  return (
    <div style={{ background: "#0a1628" }}>
      {/* Hero — split layout: text left, app screenshot right (the work is the star) */}
      <section
        style={{
          position: "relative",
          padding: "3rem 1.5rem 2.5rem",
          overflow: "hidden",
          background: "#0a1628",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          {/* Left: text */}
          <div>
            <div
              style={{
                display: "inline-block",
                padding: "0.35rem 0.8rem",
                background: "rgba(77, 168, 218, 0.12)",
                border: "1px solid rgba(77, 168, 218, 0.5)",
                borderRadius: "999px",
                fontSize: "0.72rem",
                color: "#4da8da",
                fontWeight: 600,
                letterSpacing: "0.08em",
                marginBottom: "1.25rem",
              }}
            >
              iSchool 1st Place + Promising Startup Award 2025
            </div>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "1rem",
                color: "#e8f0f8",
              }}
            >
              Medoniq — Digital Healthcare Platform
            </h1>
            <p
              style={{
                fontSize: "1.02rem",
                color: "#a0bcd4",
                lineHeight: 1.55,
                maxWidth: "480px",
                marginBottom: "1.25rem",
              }}
            >
              A full-stack web + mobile platform for family-centered healthcare
              management — medication tracking, secure health records, and
              direct doctor connectivity.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                flexWrap: "wrap",
                fontSize: "0.85rem",
                color: "#a0bcd4",
              }}
            >
              <span>
                <strong style={{ color: "#e8f0f8", fontWeight: 600 }}>Role:</strong>{" "}
                Co-Founder, UI/UX Designer, Front-End Dev
              </span>
              <span>
                <strong style={{ color: "#e8f0f8", fontWeight: 600 }}>Year:</strong> 2025
              </span>
              <span>
                <strong style={{ color: "#e8f0f8", fontWeight: 600 }}>Stack:</strong>{" "}
                React, Node.js, Figma
              </span>
            </div>
          </div>
          {/* Right: the app screenshot — this is the proof, the star */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "4 / 3",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid rgba(77, 168, 218, 0.25)",
              background: "#142840",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
            }}
          >
            <Image
              src="/images/Medoniq app.png"
              alt="Medoniq mobile app UI — multiple screens showing medication tracking, doctor profiles, health analytics"
              fill
              style={{ objectFit: "cover" }}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "0.78rem",
            color: "#4da8da",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            fontWeight: 300,
            marginBottom: "0.75rem",
          }}
        >
          The Problem
        </h2>
        <h3
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            marginBottom: "1rem",
            lineHeight: 1.2,
          }}
        >
          Families juggle medications, records, and doctor communication
          across disconnected apps and paper notes.
        </h3>
        <p
          style={{
            fontSize: "1.02rem",
            lineHeight: 1.75,
            color: "#e8f0f8",
          }}
        >
          Most healthcare apps serve a single user. But families managing care
          for children, aging parents, or chronically ill members need a
          shared surface: who took which medication, when the last
          appointment was, what the doctor said, what the next step is. That
          surface didn&rsquo;t exist in a usable form for Arabic-speaking
          families in Egypt. Medication errors, missed appointments, and
          duplicated specialist visits were the cost.
        </p>
      </section>

      {/* Solution */}
      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "1.5rem 1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "0.78rem",
            color: "#4da8da",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            fontWeight: 300,
            marginBottom: "0.75rem",
          }}
        >
          The Solution
        </h2>
        <h3
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            marginBottom: "1rem",
            lineHeight: 1.2,
          }}
        >
          One platform for the whole family — medication tracking, secure
          records, and doctor messaging in one place.
        </h3>
        <p
          style={{
            fontSize: "1.02rem",
            lineHeight: 1.75,
            color: "#e8f0f8",
            marginBottom: "1.5rem",
          }}
        >
          Medoniq combines three things families were already doing — but in
          three different places — into one platform. <strong>Medication
          tracking</strong> with reminders and a shared family view.{" "}
          <strong>Secure health records</strong> that any authorized family
          member can access. <strong>Doctor connectivity</strong> for
          scheduling and follow-ups without leaving the app.
        </p>

        {/* Solution image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "400px",
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid rgba(77, 168, 218, 0.25)",
            background: "#142840",
            marginBottom: "1rem",
          }}
        >
          <Image
            src="/images/Medoniq app.png"
            alt="Medoniq mobile app UI — multiple screens showing medication tracking, doctor profiles, health analytics, and appointment scheduling"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 760px"
          />
        </div>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#7a9bb8",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          The mobile app — multiple screens: appointment scheduling, doctor
          profiles, health analytics, file uploads, payment, and map view.
        </p>
      </section>

      {/* Design process */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
          background: "rgba(20, 40, 64, 0.4)",
          borderTop: "1px solid rgba(77, 168, 218, 0.15)",
          borderBottom: "1px solid rgba(77, 168, 218, 0.15)",
        }}
      >
        <h2
          style={{
            fontSize: "0.78rem",
            color: "#4da8da",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            fontWeight: 300,
            marginBottom: "0.75rem",
          }}
        >
          Design Process
        </h2>
        <h3
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
          }}
        >
          From research to a shipped UI system
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {[
            {
              n: "01",
              t: "User research",
              d: "Interviewed 8 families managing chronic care. Mapped pain points: medication confusion, lost paper records, no shared family view.",
            },
            {
              n: "02",
              t: "Information architecture",
              d: "Designed the family-as-unit model: one account, multiple members, role-based access (parent, child, doctor).",
            },
            {
              n: "03",
              t: "UI system in Figma",
              d: "Built a healthcare-grade component library: blue/white palette for trust, large touch targets, Arabic RTL support from day one.",
            },
            {
              n: "04",
              t: "Prototyping & testing",
              d: "Clickable Figma prototype tested with 4 families. Iterated the medication-add flow 3 times based on confusion patterns.",
            },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                padding: "1.25rem",
                background: "rgba(10, 22, 40, 0.5)",
                borderRadius: "8px",
                border: "1px solid rgba(77, 168, 218, 0.2)",
              }}
            >
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  color: "#4da8da",
                  marginBottom: "0.5rem",
                }}
              >
                {s.n}
              </p>
              <p
                style={{
                  fontSize: "1.02rem",
                  fontWeight: 700,
                  marginBottom: "0.4rem",
                }}
              >
                {s.t}
              </p>
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "#7a9bb8",
                  lineHeight: 1.55,
                }}
              >
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Engineering */}
      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "0.78rem",
            color: "#4da8da",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            fontWeight: 300,
            marginBottom: "0.75rem",
          }}
        >
          Engineering
        </h2>
        <h3
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          Web platform on React + Node.js; mobile app designed in Figma
        </h3>
        <p
          style={{
            fontSize: "1.02rem",
            lineHeight: 1.75,
            color: "#e8f0f8",
            marginBottom: "1.5rem",
          }}
        >
          The web platform is built on React with a Node.js backend, using a
          REST API for the family/member/medication data model. The mobile
          app is fully designed in Figma (the screens you see above) and
          ready for React Native implementation. Security was non-negotiable:
          all health records are encrypted at rest, and family-member access
          is role-based (parent vs. child vs. doctor).
        </p>

        {/* Tech stack badges — proves 'shipped React' */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "1.5rem",
          }}
        >
          {["React", "Node.js", "REST API", "Figma", "TypeScript", "JWT auth", "Encrypted at rest"].map((t) => (
            <span
              key={t}
              style={{
                fontSize: "0.75rem",
                color: "#4da8da",
                border: "1px solid rgba(77, 168, 218, 0.45)",
                padding: "0.3rem 0.7rem",
                borderRadius: "999px",
                background: "rgba(77, 168, 218, 0.05)",
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* GitHub repo link — proves the code exists */}
        <a
          href="https://github.com/Mahmoud-ABDALKream/portfolio"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "0.6rem 1.2rem",
            background: "rgba(77, 168, 218, 0.1)",
            border: "1px solid #4da8da",
            borderRadius: "6px",
            color: "#4da8da",
            fontSize: "0.9rem",
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: "1.5rem",
          }}
        >
          View source code on GitHub &rarr;
        </a>

        {/* Engineering image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "350px",
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid rgba(77, 168, 218, 0.25)",
            background: "#142840",
          }}
        >
          <Image
            src="/images/portfolio-mockup-laptop 3.png"
            alt="Medoniq web platform — landing page on laptop showing the family health management headline and phone mockup"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 760px"
          />
        </div>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#7a9bb8",
            textAlign: "center",
            marginTop: "0.75rem",
          }}
        >
          The web platform landing page — &ldquo;Your Family&rsquo;s Health,
          Harmony at Last.&rdquo;
        </p>
      </section>

      {/* Outcome */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
          background: "rgba(20, 40, 64, 0.4)",
          borderTop: "1px solid rgba(77, 168, 218, 0.15)",
          borderBottom: "1px solid rgba(77, 168, 218, 0.15)",
        }}
      >
        <h2
          style={{
            fontSize: "0.78rem",
            color: "#4da8da",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            fontWeight: 300,
            marginBottom: "0.75rem",
          }}
        >
          Outcome
        </h2>
        <h3
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
          }}
        >
          iSchool Startup Teens 2025 — 1st Place + Promising Startup Award
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            { stat: "1st Place", label: "iSchool Startup Teens 2025" },
            { stat: "Promising", label: "Startup Award" },
            { stat: "Pitched", label: "at British University in Egypt" },
            { stat: "8 families", label: "interviewed in research phase" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 900,
                  color: "#4da8da",
                  marginBottom: "0.4rem",
                }}
              >
                {s.stat}
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#7a9bb8",
                  lineHeight: 1.4,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
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
          Gallery
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {[
            {
              src: "/images/Medoniq app.png",
              cap: "Mobile app UI — full screen set",
            },
            {
              src: "/images/portfolio-mockup-laptop 3.png",
              cap: "Web platform — landing page",
            },
          ].map((g) => (
            <div
              key={g.src}
              style={{
                position: "relative",
                width: "100%",
                height: "240px",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid rgba(77, 168, 218, 0.25)",
                background: "#142840",
              }}
            >
              <Image
                src={g.src}
                alt={g.cap}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
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
          Let&rsquo;s build something →
        </Link>
      </section>
    </div>
  );
}
