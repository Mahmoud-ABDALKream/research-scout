"use client";

import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // POST the form data to the API route
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.ok) {
        setSubmitted(true);
        setResponse(data);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#0a1628" }}>
      {/* Hero */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "4rem 1.5rem 2rem",
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
          Available for freelance &amp; full-time work
        </p>
        <h1
          style={{
            fontSize: "clamp(2.25rem, 6vw, 3.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: "1.25rem",
          }}
        >
          Let&rsquo;s work together
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#7a9bb8",
            maxWidth: "560px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          I&rsquo;m interested in healthcare solutions, e-commerce projects, and
          innovative digital products. Get in touch.
        </p>
      </section>

      {/* Interests + Form */}
      <section
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
          display: "grid",
          gridTemplateColumns: "minmax(260px, 1fr) minmax(320px, 1.6fr)",
          gap: "3rem",
          alignItems: "start",
        }}
      >
        {/* Left column: interests + direct contact */}
        <div>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#4da8da",
              marginBottom: "1rem",
              letterSpacing: "0.05em",
            }}
          >
            What I&rsquo;m looking for
          </h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: "#e8f0f8",
              marginBottom: "2.5rem",
            }}
          >
            <li style={{ marginBottom: "0.6rem", paddingLeft: "1.25rem", position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "#4da8da" }}>→</span>
              Healthcare product roles (Medoniq-shaped problems)
            </li>
            <li style={{ marginBottom: "0.6rem", paddingLeft: "1.25rem", position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "#4da8da" }}>→</span>
              E-commerce front-end (especially Arabic RTL)
            </li>
            <li style={{ marginBottom: "0.6rem", paddingLeft: "1.25rem", position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "#4da8da" }}>→</span>
              Innovative digital products (IoT, sustainability)
            </li>
            <li style={{ marginBottom: "0.6rem", paddingLeft: "1.25rem", position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "#4da8da" }}>→</span>
              Freelance web development (Upwork-style engagements)
            </li>
          </ul>

          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#4da8da",
              marginBottom: "1rem",
              letterSpacing: "0.05em",
            }}
          >
            Or reach me directly
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              fontSize: "0.92rem",
            }}
          >
            <a
              href="mailto:mahmoudabdelkreambusiness@gmail.com"
              style={{
                color: "#e8f0f8",
                textDecoration: "none",
                padding: "0.6rem 0.85rem",
                background: "rgba(77, 168, 218, 0.08)",
                border: "1px solid rgba(77, 168, 218, 0.25)",
                borderRadius: "6px",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#4da8da")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor =
                  "rgba(77, 168, 218, 0.25)")
              }
            >
              ✉ mahmoudabdelkreambusiness@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/mahmoud-abd-elkream/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#e8f0f8",
                textDecoration: "none",
                padding: "0.6rem 0.85rem",
                background: "rgba(77, 168, 218, 0.08)",
                border: "1px solid rgba(77, 168, 218, 0.25)",
                borderRadius: "6px",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#4da8da")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor =
                  "rgba(77, 168, 218, 0.25)")
              }
            >
              in LinkedIn
            </a>
            <a
              href="https://github.com/Mahmoud-ABDALKream"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#e8f0f8",
                textDecoration: "none",
                padding: "0.6rem 0.85rem",
                background: "rgba(77, 168, 218, 0.08)",
                border: "1px solid rgba(77, 168, 218, 0.25)",
                borderRadius: "6px",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#4da8da")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor =
                  "rgba(77, 168, 218, 0.25)")
              }
            >
              ⌥ GitHub
            </a>
            <a
              href="https://github.com/Mahmoud-ABDALKream/portfolio/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#e8f0f8",
                textDecoration: "none",
                padding: "0.6rem 0.85rem",
                background: "rgba(77, 168, 218, 0.08)",
                border: "1px solid rgba(77, 168, 218, 0.25)",
                borderRadius: "6px",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#4da8da")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor =
                  "rgba(77, 168, 218, 0.25)")
              }
            >
              ⬇ Download CV (PDF)
            </a>
            <a
              href="mailto:mahmoudabdelkreambusiness@gmail.com?subject=Book%20a%20call&body=Hi%20Mahmoud%2C%20I%27d%20like%20to%20book%20a%20call%20to%20discuss..."
              style={{
                color: "#e8f0f8",
                textDecoration: "none",
                padding: "0.6rem 0.85rem",
                background: "rgba(77, 168, 218, 0.08)",
                border: "1px solid rgba(77, 168, 218, 0.25)",
                borderRadius: "6px",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#4da8da")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor =
                  "rgba(77, 168, 218, 0.25)")
              }
            >
              📅 Book a call
            </a>
          </div>
        </div>

        {/* Right column: form */}
        <div
          style={{
            padding: "2rem",
            background: "rgba(228, 236, 245, 0.05)",
            border: "1px solid rgba(77, 168, 218, 0.25)",
            borderRadius: "12px",
          }}
        >
          {submitted ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "#4da8da",
                  marginBottom: "0.75rem",
                }}
              >
                ✓ Message received
              </p>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#7a9bb8",
                  lineHeight: 1.6,
                  marginBottom: "1rem",
                }}
              >
                Your message was submitted successfully. I&apos;ll get back to you
                at <strong style={{ color: "#e8f0f8" }}>{response?.submission?.email}</strong> within 24 hours.
              </p>
              {response?.timestamp && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#5a7a96",
                    marginBottom: "1.5rem",
                  }}
                >
                  Submission ID: {response.timestamp}<br />
                  Message length: {response?.submission?.message_length} characters
                </p>
              )}
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", message: "" });
                  setResponse(null);
                }}
                style={{
                  padding: "0.6rem 1.25rem",
                  background: "transparent",
                  border: "1px solid #4da8da",
                  color: "#e8f0f8",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                }}
              >
                Send a message
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                <div>
                  <label
                    htmlFor="name"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      color: "#7a9bb8",
                      marginBottom: "0.4rem",
                      fontWeight: 500,
                    }}
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.85rem",
                      background: "rgba(10, 22, 40, 0.6)",
                      border: "1px solid rgba(77, 168, 218, 0.3)",
                      borderRadius: "6px",
                      color: "#e8f0f8",
                      fontSize: "0.95rem",
                      outline: "none",
                    }}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      color: "#7a9bb8",
                      marginBottom: "0.4rem",
                      fontWeight: 500,
                    }}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.85rem",
                      background: "rgba(10, 22, 40, 0.6)",
                      border: "1px solid rgba(77, 168, 218, 0.3)",
                      borderRadius: "6px",
                      color: "#e8f0f8",
                      fontSize: "0.95rem",
                      outline: "none",
                    }}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      color: "#7a9bb8",
                      marginBottom: "0.4rem",
                      fontWeight: 500,
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.85rem",
                      background: "rgba(10, 22, 40, 0.6)",
                      border: "1px solid rgba(77, 168, 218, 0.3)",
                      borderRadius: "6px",
                      color: "#e8f0f8",
                      fontSize: "0.95rem",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                    placeholder="Tell me about your project or role..."
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: "0.85rem 1.5rem",
                    background: "#4da8da",
                    color: "#0a1628",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#7fd0f0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#4da8da")
                  }
                >
                  {submitting ? "Sending..." : "Send message →"}
                </button>
                {error && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#f87171",
                      marginTop: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      background: "rgba(248, 113, 113, 0.1)",
                      border: "1px solid rgba(248, 113, 113, 0.3)",
                      borderRadius: "6px",
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
