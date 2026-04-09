// app/api/admin/send-invoice/route.ts
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoice_id } = body;

    if (!invoice_id) {
      return NextResponse.json({ error: "invoice_id is required" }, { status: 400 });
    }

    // Fetch invoice + client via service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select("*, clients(name, email, company)")
      .eq("id", invoice_id)
      .single();

    if (invErr || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const client = invoice.clients;
    if (!client?.email) {
      return NextResponse.json({ error: "Client email not found" }, { status: 400 });
    }

    const invoiceNum  = invoice.invoice_number ?? `INV-${invoice.id.substring(0, 8).toUpperCase()}`;
    const dueDate     = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Upon receipt";
    const amountFmt   = `£${Number(invoice.amount).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const issuedDate  = new Date(invoice.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;padding:24px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a8a,#0284c7);border-radius:16px;padding:28px 32px;margin-bottom:20px;position:relative;overflow:hidden;">
      <div style="position:relative;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <span style="color:white;font-weight:800;font-size:1.2rem;">Z</span>
          </div>
          <div>
            <div style="color:white;font-weight:700;font-size:1rem;">Zempotis</div>
            <div style="color:rgba(147,197,253,0.8);font-size:0.75rem;">Digital Solutions</div>
          </div>
        </div>
        <h1 style="color:white;margin:0 0 4px;font-size:1.5rem;font-weight:800;">Invoice</h1>
        <p style="color:rgba(148,163,184,0.9);margin:0;font-size:0.9rem;">${invoiceNum}</p>
      </div>
    </div>

    <!-- Invoice Details -->
    <div style="background:white;border-radius:14px;padding:28px 32px;margin-bottom:16px;border:1px solid #bfdbfe;">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px;">
        <div>
          <div style="font-size:0.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Billed To</div>
          <div style="font-weight:700;font-size:1rem;color:#0f172a;">${client.name}</div>
          ${client.company ? `<div style="color:#64748b;font-size:0.875rem;">${client.company}</div>` : ""}
          <div style="color:#64748b;font-size:0.875rem;">${client.email}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Invoice Info</div>
          <div style="font-size:0.875rem;color:#334155;"><strong>Issued:</strong> ${issuedDate}</div>
          <div style="font-size:0.875rem;color:#334155;"><strong>Due:</strong> ${dueDate}</div>
          <div style="font-size:0.875rem;color:#334155;"><strong>Ref:</strong> ${invoiceNum}</div>
        </div>
      </div>

      <!-- Line item -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
            <th style="padding:10px 14px;text-align:left;font-size:0.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Description</th>
            <th style="padding:10px 14px;text-align:right;font-size:0.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:14px;font-size:0.9rem;color:#334155;">${invoice.description || "Services rendered"}</td>
            <td style="padding:14px;text-align:right;font-size:0.9rem;font-weight:600;color:#0f172a;">${amountFmt}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding:14px;font-weight:700;font-size:1rem;color:#0f172a;">Total Due</td>
            <td style="padding:14px;text-align:right;font-weight:800;font-size:1.3rem;color:#2563eb;">${amountFmt}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Payment note -->
      <div style="background:#f0f7ff;border-radius:10px;padding:16px 18px;border:1px solid #bfdbfe;">
        <p style="margin:0;font-size:0.85rem;color:#1e40af;line-height:1.6;">
          Please make payment by <strong>${dueDate}</strong>.
          If you have any questions about this invoice, please contact us at
          <a href="mailto:hello@zempotis.com" style="color:#2563eb;">hello@zempotis.com</a>.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#94a3b8;font-size:0.75rem;margin:16px 0 0;">
      Zempotis Ltd · <a href="https://zempotis.com" style="color:#2563eb;">zempotis.com</a> · hello@zempotis.com
    </p>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: "Zempotis <hello@zempotis.com>",
      to:   client.email,
      subject: `Invoice ${invoiceNum} from Zempotis — ${amountFmt} due ${dueDate}`,
      html,
    });

    // Mark invoice as sent + log activity
    await supabase.from("invoices").update({ status: "pending" }).eq("id", invoice_id);

    // Create notification on the client portal
    // Use invoice.client_id directly — it's already the clients.id UUID
    if (invoice.client_id) {
      const { error: notifErr } = await supabase.from("client_notifications").insert([{
        client_id:  invoice.client_id,
        type:       "invoice",
        title:      "New invoice received",
        message:    `${invoiceNum} · ${amountFmt} — due ${dueDate}`,
        invoice_id: invoice_id,
        read:       false,
      }]);
      if (notifErr) console.error("Notification insert error:", notifErr.message);
    } else {
      console.warn("send-invoice: invoice.client_id is null — skipping notification");
    }

    await supabase.from("activity_log").insert([{
      event_type: "invoice_sent",
      title: `Invoice sent to ${client.name}`,
      description: `${invoiceNum} · ${amountFmt}`,
      metadata: { invoice_id, client_email: client.email, amount: invoice.amount },
    }]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Send invoice error:", error);
    return NextResponse.json({ error: "Failed to send invoice" }, { status: 500 });
  }
}
