import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await req.json();
    const { firstName, lastName, email, company, reason, message, budget } = body;

    if (!firstName || !email || !reason || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Email to admin
    await resend.emails.send({
      from: "Zempotis Contact <hello@zempotis.com>",
      to: process.env.CONTACT_EMAIL!,
      subject: `New Enquiry from ${firstName} ${lastName} — ${reason}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f0f7ff; border-radius: 12px;">

          <div style="background: #ffffff; border: 2px solid #2563eb; padding: 24px 32px; border-radius: 10px; margin-bottom: 24px; text-align: center;">
            <h1 style="color: #2563eb; margin: 0; font-size: 1.4rem; font-weight: 700;">New Zempotis Enquiry</h1>
            <p style="color: #3b82f6; margin: 6px 0 0; font-size: 0.9rem; font-weight: 500;">${reason}</p>
          </div>

          <div style="background: white; border-radius: 10px; padding: 24px; margin-bottom: 16px; border: 1px solid #bfdbfe;">
            <h2 style="color: #1e3a8a; font-size: 1rem; margin: 0 0 16px; border-bottom: 1px solid #bfdbfe; padding-bottom: 10px;">Contact Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem; width: 140px;">Name</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem;">Company</td>
                <td style="padding: 8px 0; color: #0f172a;">${company}</td>
              </tr>` : ""}
              ${budget ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem;">Budget</td>
                <td style="padding: 8px 0; color: #0f172a;">${budget}</td>
              </tr>` : ""}
            </table>
          </div>

          <div style="background: white; border-radius: 10px; padding: 24px; border: 1px solid #bfdbfe;">
            <h2 style="color: #1e3a8a; font-size: 1rem; margin: 0 0 12px; border-bottom: 1px solid #bfdbfe; padding-bottom: 10px;">Message</h2>
            <p style="color: #334155; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>

          <p style="text-align: center; color: #64748b; font-size: 0.75rem; margin-top: 24px;">
            Sent from zempotis.com contact form
          </p>
        </div>
      `,
    });

    // Confirmation email to enquirer
    await resend.emails.send({
      from: "Zempotis <hello@zempotis.com>",
      to: email,
      subject: "We've received your enquiry — Zempotis",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f0f7ff; border-radius: 12px;">

          <div style="background: #ffffff; border: 2px solid #2563eb; padding: 24px 32px; border-radius: 10px; margin-bottom: 24px; text-align: center;">
            <h1 style="color: #2563eb; margin: 0; font-size: 1.4rem; font-weight: 700;">Thanks for reaching out, ${firstName}!</h1>
            <p style="color: #3b82f6; margin: 6px 0 0; font-size: 0.9rem;">We'll be in touch within one business day.</p>
          </div>

          <div style="background: white; border-radius: 10px; padding: 24px; border: 1px solid #bfdbfe;">
            <p style="color: #334155; line-height: 1.7; margin: 0 0 12px;">We've received your message and will get back to you within <strong style="color: #2563eb;">one business day</strong>.</p>
            <p style="color: #334155; line-height: 1.7; margin: 0 0 12px;">In the meantime, feel free to explore our services and pricing at <a href="https://zempotis.com" style="color: #2563eb; font-weight: 600;">zempotis.com</a>.</p>
            <p style="color: #334155; line-height: 1.7; margin: 0;">— The Zempotis Team</p>
          </div>

          <p style="text-align: center; color: #64748b; font-size: 0.75rem; margin-top: 24px;">
            Zempotis Ltd · zempotis.com
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
