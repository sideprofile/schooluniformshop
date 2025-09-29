import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Helper to format currency in PKR (Rs.)
function formatPKR(n: number) {
  try {
    return new Intl.NumberFormat("en-PK").format(Math.round(n));
  } catch {
    return String(Math.round(n));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { customer, items, pricing } = body as {
      customer?: { name?: string; phone?: string; address?: string };
      items?: Array<{ name: string; quantity: number; unitPrice: number; lineTotal?: number }>;
      pricing?: { subtotal: number; shipping: number; total: number };
    };

    if (!customer?.name || !customer.phone || !customer.address) {
      return NextResponse.json({ error: "Missing customer fields" }, { status: 400 });
    }

    // Basic Pakistan phone validation on server too
    const cleanedPhone = customer.phone.replace(/\s|-/g, "");
    if (!/^(\+92|0)3\d{9}$/.test(cleanedPhone)) {
      return NextResponse.json({ error: "Invalid Pakistani phone format" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const subtotal = Number(pricing?.subtotal ?? 0);
    const shipping = Number(pricing?.shipping ?? 250);
    const total = Number(pricing?.total ?? subtotal + shipping);

    // Build email content
    const linesHtml = items
      .map((it, idx) => {
        const lineTotal = it.lineTotal ?? it.unitPrice * it.quantity;
        return `<tr>
          <td style="padding:6px;border:1px solid #e5e7eb;">${idx + 1}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;">${it.name}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;">${it.quantity}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;">Rs. ${formatPKR(it.unitPrice)}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;">Rs. ${formatPKR(lineTotal)}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;">
        <h2 style="margin:0 0 12px;">New Uniform Order</h2>
        <p style="margin:0 0 16px;">You have received a new order via the website checkout.</p>
        <h3 style="margin:0 0 8px;">Customer Details</h3>
        <div style="margin:0 0 16px;">
          <div><strong>Name:</strong> ${customer.name}</div>
          <div><strong>Phone:</strong> ${customer.phone}</div>
          <div><strong>Address:</strong> ${customer.address}</div>
        </div>
        <h3 style="margin:0 0 8px;">Items</h3>
        <table style="border-collapse:collapse;border:1px solid #e5e7eb;width:100%;margin-bottom:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px;border:1px solid #e5e7eb;">#</th>
              <th style="text-align:left;padding:6px;border:1px solid #e5e7eb;">Item</th>
              <th style="text-align:left;padding:6px;border:1px solid #e5e7eb;">Qty</th>
              <th style="text-align:left;padding:6px;border:1px solid #e5e7eb;">Unit</th>
              <th style="text-align:left;padding:6px;border:1px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>${linesHtml}</tbody>
        </table>
        <div style="margin:8px 0;">
          <div><strong>Subtotal:</strong> Rs. ${formatPKR(subtotal)}</div>
          <div><strong>Delivery:</strong> Rs. ${formatPKR(shipping)}</div>
          <div><strong>Grand Total:</strong> Rs. ${formatPKR(total)}</div>
        </div>
        <p style="margin-top:16px;">Delivery charges are Rs. 250. Items will be delivered in 3 to 4 business days.</p>
      </div>
    `;

    const text = [
      "New Uniform Order",
      "",
      `Customer: ${customer.name}`,
      `Phone: ${customer.phone}`,
      `Address: ${customer.address}`,
      "",
      "Items:",
      ...items.map((it, idx) => {
        const lineTotal = it.lineTotal ?? it.unitPrice * it.quantity;
        return `${idx + 1}. ${it.name} | Qty ${it.quantity} | Unit Rs. ${formatPKR(it.unitPrice)} | Total Rs. ${formatPKR(lineTotal)}`;
      }),
      "",
      `Subtotal: Rs. ${formatPKR(subtotal)}`,
      `Delivery: Rs. ${formatPKR(shipping)}`,
      `Grand Total: Rs. ${formatPKR(total)}`,
      "",
      "Delivery charges are Rs. 250. Items will be delivered in 3 to 4 business days.",
    ].join("\n");

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.FROM_EMAIL || user;
    const to = process.env.TO_EMAIL || "waqarahmedsultan397@gmail.com";

    if (!host || !user || !pass || !from) {
      return NextResponse.json({ error: "SMTP env vars missing (SMTP_HOST, SMTP_USER, SMTP_PASS, FROM_EMAIL)" }, { status: 500 });
    }

    // Gmail handling: prefer service=gmail (works best with App Passwords)
    const isGmail = /smtp\.gmail\.com/i.test(String(host)) || /@gmail\.com$/i.test(String(user || ""));
    const transporter = nodemailer.createTransport(
      isGmail
        ? { service: "gmail", auth: { user: String(user), pass: String(pass) } }
        : { host, port, secure: port === 465, auth: { user, pass } }
    );

    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject: `New Order from ${customer.name} (${cleanedPhone})`,
        text,
        html,
      });
      return NextResponse.json({ ok: true, messageId: info.messageId });
    } catch (err: any) {
      const msg = String(err?.message || err);
      const resp = String(err?.response || "");
      if (msg.includes("535") || resp.includes("535")) {
        return NextResponse.json(
          {
            error:
              "SMTP authentication failed (Gmail 535). If you're using Gmail, enable 2-Step Verification and use an App Password (host=smtp.gmail.com, port=465, secure SSL).",
            hint:
              "Steps: Google Account → Security → 2‑Step Verification → App passwords → App: Mail, Device: Other → generate 16‑char password and set SMTP_PASS to it.",
          },
          { status: 401 }
        );
      }
      console.error("send-order-email error:", err);
      return NextResponse.json({ error: err?.message || "Failed to send email" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("send-order-email error:", err);
    return NextResponse.json({ error: err?.message || "Failed to send email" }, { status: 500 });
  }
}