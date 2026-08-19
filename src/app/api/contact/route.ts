import { NextResponse } from "next/server";

/**
 * Contact form API route — receives form submissions, validates them,
 * and returns a structured response.
 *
 * This is the "backend" for the contact form on /contact.
 * Data flow: browser → POST /api/contact → this function → JSON response
 *
 * In production, you'd forward the submission to an email service (Resend,
 * Formspree, SendGrid) or save it to a database (Vercel KV, Supabase).
 * For the MVP, we validate + return the data so the user can verify it works.
 */

export async function POST(request: Request) {
  try {
    // 1. Parse the incoming form data
    const body = await request.json();
    const { name, email, message } = body;

    // 2. Validate — all three fields required
    if (!name || !email || !message) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing required fields. Name, email, and message are all required.",
          received: { name: !!name, email: !!email, message: !!message },
        },
        { status: 400 }
      );
    }

    // 2.5. Max length validation (prevent abuse)
    const MAX_NAME = 100;
    const MAX_EMAIL = 100;
    const MAX_MESSAGE = 2000;
    if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
      return NextResponse.json(
        {
          ok: false,
          error: `Input too long. Max: name ${MAX_NAME}, email ${MAX_EMAIL}, message ${MAX_MESSAGE} characters.`,
        },
        { status: 400 }
      );
    }

    // 3. Validate email format (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid email format. Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    // 3.5. Sanitize input — strip HTML tags to prevent XSS in response
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, "").trim();
    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email);
    const cleanMessage = sanitize(message);

    // 4. Construct a mailto link so the submission can be forwarded
    const mailtoLink = `mailto:mahmoudabdelkreambusiness@gmail.com?subject=Portfolio%20Contact%3A%20${encodeURIComponent(cleanName)}&body=${encodeURIComponent(`Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`)}`;

    // 5. Return the structured response (sanitized data only)
    return NextResponse.json({
      ok: true,
      message: "Submission received successfully.",
      timestamp: new Date().toISOString(),
      submission: {
        name: cleanName,
        email: cleanEmail,
        message: cleanMessage,
        message_length: cleanMessage.length,
      },
      next_step: "Forward to email or save to database (production setup).",
      mailto_forward: mailtoLink,
    });
  } catch (error) {
    // 6. Handle JSON parse errors or other issues
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to process submission. Make sure you're sending valid JSON.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also handle GET so people can test the endpoint in a browser
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/contact",
    method: "POST",
    description: "Contact form submission API. Send { name, email, message } as JSON.",
    example: {
      name: "John Doe",
      email: "john@example.com",
      message: "Hi Mahmoud, I'd like to discuss a project.",
    },
  });
}
