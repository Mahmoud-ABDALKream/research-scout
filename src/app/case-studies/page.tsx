import Link from "next/link";

export default function CaseStudies() {
  return (
    <div style={{ background: "#0a1628" }}>
      {/* Header */}
      <section
        style={{
          maxWidth: "900px",
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
          In-Depth Analysis
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "1rem",
          }}
        >
          Case Studies
        </h1>
        <p
          style={{
            fontSize: "1.05rem",
            color: "#7a9bb8",
            maxWidth: "640px",
            lineHeight: 1.6,
          }}
        >
          The competitions and projects that shaped how I think about
          technology, design, and innovation. Each one is a story of a real
          problem, a real attempt, and a real outcome.
        </p>
      </section>

      {/* Cases list */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {[
            {
              year: "2024",
              title: "Aqua Flow — Smart Energy Conversion System",
              tag: "Lead Case · Renewable Energy & IoT",
              badge: "Finalist – Fanni Mobtaker 2024",
              body: [
                "Developed an innovative system that converts gasoline-powered generators into solar-driven units designed for industrial use. The project aims to reduce electricity costs, lower emissions, and promote sustainable energy in factories through a hybrid solar-battery solution.",
                "The system was selected as a finalist at Fanni Mobtaker 2024, and the work was featured on ON TV and Al-Hayat TV — bringing the project to a national audience and sparking conversations about industrial renewable energy in Egypt.",
                "Tech: IoT sensors, solar-charge controller, battery management system, hybrid inverter, mobile monitoring dashboard. The hardest engineering problem was making the switchover between grid, solar, and battery seamless — without the factory noticing a power interruption.",
              ],
              skills: ["IoT", "Renewable Energy", "Sustainability", "Innovation"],
            },
            {
              year: "2025",
              title: "IEEE YESIST12 — Malaysia Finals",
              tag: "International Competition",
              badge: "Top 1000 Worldwide · Mentor & Special Track Participant",
              body: [
                "Represented Egypt internationally in the special track competition focused on tech-driven social impact. The Malaysia finals brought together teams from across Asia and the Middle East.",
                "Beyond competing, I mentored other teams and contributed to sustainable innovation proposals. The mentorship role was as valuable as the competition itself — teaching forced me to articulate design decisions I had previously made on instinct.",
              ],
              skills: ["Mentoring", "Social Impact", "International"],
            },
            {
              year: "2024",
              title: "IEEE YESIST12 — Tunisia Finals",
              tag: "International Competition",
              badge: "5th Place in Egypt · Top 1000 Worldwide · International Finalist",
              body: [
                "Competed in the 2023 edition (finals held in Tunisia 2024), designing a tech-based prototype that addressed real-world challenges through teamwork and advanced programming.",
                "The 5th-place finish in Egypt was the result of three months of iteration on the prototype — we rebuilt the core interaction model twice after user testing revealed confusion patterns we hadn&rsquo;t anticipated.",
              ],
              skills: ["Prototyping", "Teamwork", "Algorithm"],
            },
            {
              year: "2025",
              title: "iSchool Startup Teens Competition",
              tag: "Entrepreneurship",
              badge: "1st Place Overall + Promising Startup Award",
              body: [
                "Co-founded Medoniq, a healthcare startup idea focusing on medical data management and accessibility. The competition asked us to pitch not just a product but a business — which forced clarity on who pays, who uses, and who benefits.",
                "We pitched at the British University in Egypt and won both the 1st Place Overall and the Promising Startup Award. The win validated that the problem (family healthcare coordination) was real and the solution (Medoniq) was defensible.",
              ],
              skills: ["Entrepreneurship", "UI/UX Design", "Pitching"],
            },
            {
              year: "2023–2025",
              title: "ECPC — Egyptian Collegiate Programming Contest",
              tag: "Competitive Programming",
              badge: "Top 9 in Egypt · Competed 3 Consecutive Years",
              body: [
                "Participated three consecutive times in Egypt&rsquo;s most competitive programming contest, solving algorithmic challenges under time pressure. The problems range from graph theory to dynamic programming to greedy optimization.",
                "ECPC taught me to think in algorithms — not just write code. Three years of competition built a reflex for decomposing problems into subproblems, which now shows up in every system I design.",
              ],
              skills: ["Algorithms", "Competitive Programming", "Optimization"],
            },
            {
              year: "2023–2024",
              title: "WorldSkills Egypt",
              tag: "National Competition",
              badge: "National Representative · Selected Twice",
              body: [
                "Selected twice to represent WE Schools in the national technology and design competition. WorldSkills tests both technical execution and time management — every task has a strict deadline.",
                "Being selected twice was less about raw skill and more about consistency: the ability to show up prepared, deliver under pressure, and learn from the first attempt before the second.",
              ],
              skills: ["Technical Execution", "Time Management", "Leadership"],
            },
            {
              year: "2023–2025",
              title: "Intel ISEF & ISF Competitions",
              tag: "International Science Fairs",
              badge: "ISEF & ISF Finalist",
              body: [
                "Represented Egypt in multiple international science and engineering fairs, showcasing innovation and technical problem-solving on a global stage.",
                "ISEF and ISF are different from hackathons — the work is judged on scientific rigor, not just demo polish. That shift in evaluation criteria changed how I present work: less &lsquo;look what I built&rsquo;, more &lsquo;here&rsquo;s the hypothesis, here&rsquo;s the method, here&rsquo;s the evidence.&rsquo;",
              ],
              skills: ["STEM Innovation", "National Representation", "Research"],
            },
          ].map((c) => (
            <article
              key={c.title}
              style={{
                padding: "2rem",
                background: "rgba(228, 236, 245, 0.05)",
                border: "1px solid rgba(77, 168, 218, 0.2)",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#4da8da",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      marginBottom: "0.4rem",
                    }}
                  >
                    {c.tag}
                  </p>
                  <h2
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      lineHeight: 1.2,
                      color: "#e8f0f8",
                    }}
                  >
                    {c.title}
                  </h2>
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#7a9bb8",
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {c.year}
                </p>
              </div>
              <div
                style={{
                  display: "inline-block",
                  padding: "0.4rem 0.85rem",
                  background: "rgba(77, 168, 218, 0.15)",
                  border: "1px solid rgba(77, 168, 218, 0.4)",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  color: "#4da8da",
                  fontWeight: 600,
                  marginBottom: "1.25rem",
                }}
              >
                {c.badge}
              </div>
              <div
                style={{
                  fontSize: "0.98rem",
                  lineHeight: 1.7,
                  color: "#e8f0f8",
                }}
              >
                {c.body.map((p, i) => (
                  <p
                    key={i}
                    style={{
                      marginBottom: i < c.body.length - 1 ? "0.85rem" : 0,
                    }}
                  >
                    {p}
                  </p>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  marginTop: "1.25rem",
                }}
              >
                {c.skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: "0.75rem",
                      color: "#7a9bb8",
                      border: "1px solid rgba(77, 168, 218, 0.25)",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </article>
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
          Contact me →
        </Link>
      </section>
    </div>
  );
}
