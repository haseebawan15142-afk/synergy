import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isSmtpConfigured, sendSmtpMail } from "@/lib/email/smtp";

export const runtime = "nodejs";

const MAX_REPLY_CHARS = 5000;

async function requireAdmin(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const token = match?.[1]?.trim();
  if (!token) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const profile = await getAdminDb().collection(COLLECTIONS.users).doc(decoded.uid).get();
    if (!profile.exists || profile.data()?.role !== "admin") {
      return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
    }
    return { uid: decoded.uid, email: decoded.email || "" };
  } catch {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth && auth.error) return auth.error;

  if (!isSmtpConfigured()) {
    return NextResponse.json(
      {
        error: "smtp_not_configured",
        message:
          "Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM to .env.local.",
      },
      { status: 503 },
    );
  }

  let body: { messageId?: string; replyText?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const messageId = String(body.messageId || "").trim();
  const replyText = String(body.replyText || "").trim();
  if (!messageId || !replyText) {
    return NextResponse.json({ error: "messageId_and_replyText_required" }, { status: 400 });
  }
  if (replyText.length > MAX_REPLY_CHARS) {
    return NextResponse.json({ error: "reply_too_long" }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = db.collection(COLLECTIONS.messages).doc(messageId);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "message_not_found" }, { status: 404 });
  }

  const data = snap.data() || {};
  const toEmail = String(data.email || "").trim();
  const name = String(data.name || "there").trim() || "there";
  const original = String(data.message || "").trim();
  if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
    return NextResponse.json({ error: "invalid_recipient" }, { status: 400 });
  }

  const subject = `Re: Your message to Synergy Computers`;
  const text = [
    `Hi ${name},`,
    "",
    replyText,
    "",
    "—",
    "Synergy Computers",
    "",
    "---------- Original message ----------",
    original || "(no message body)",
  ].join("\n");

  const html = `
    <p>Hi ${escapeHtml(name)},</p>
    <p>${escapeHtml(replyText).replace(/\n/g, "<br/>")}</p>
    <p style="margin-top:1.5rem;color:#64748b;">—<br/>Synergy Computers</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0;" />
    <p style="color:#64748b;font-size:13px;"><strong>Original message</strong></p>
    <blockquote style="margin:0;padding:0.75rem 1rem;border-left:3px solid #cbd5e1;color:#475569;">
      ${escapeHtml(original || "(no message body)").replace(/\n/g, "<br/>")}
    </blockquote>
  `;

  try {
    const info = await sendSmtpMail({
      to: toEmail,
      subject,
      text,
      html,
    });

    await ref.update({
      replied: true,
      replyStatus: "replied",
      repliedAt: FieldValue.serverTimestamp(),
      status: data.status === "unread" ? "read" : data.status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, id: info.messageId ?? null });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send reply";
    return NextResponse.json({ error: "send_failed", message }, { status: 502 });
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
