// Vercel serverless function — emails a guest their RSVP confirmation
// through the couple's own Gmail.
//
// Credentials live in Vercel environment variables and are read only
// here, on the server, so nothing sensitive is ever shipped to the
// browser (the flaw with client-side senders like EmailJS, whose key
// is visible in the page source):
//   GMAIL_USER          — the sending Gmail address
//   GMAIL_APP_PASSWORD  — a Google App Password (not the account password)
//
// Note: this endpoint is public, so it is deliberately narrow — it only
// ever sends this one fixed RSVP-confirmation template, to a single
// recipient, with every field length-capped and HTML-escaped.
const nodemailer = require("nodemailer");

const MAX = 300; // per-field character cap
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Escape before interpolating guest-supplied text into the HTML email,
// so a name like `<b>` can't inject markup into the message.
const esc = (v) =>
  String(v == null ? "" : v)
    .slice(0, MAX)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const EVENT_WHEN = "Sunday, September 20, 2026 · 6:00 PM";
const EVENT_WHERE = "Speranza Banquet Hall, 510 Deerhurst Dr, Brampton, ON L6T 5H9";
const CAL_LINK =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent("Mannat & Sree's Engagement") +
  "&dates=20260920T220000Z/20260921T030000Z" +
  "&details=" + encodeURIComponent("Join us to celebrate the engagement of Mannat & Sree! Guest arrival from 6:00 PM.") +
  "&location=" + encodeURIComponent(EVENT_WHERE);
const MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(EVENT_WHERE);

function row(label, value) {
  if (!value || value === "—") return "";
  return `
    <tr>
      <td style="padding:5px 0;color:#6b7257;font-family:Helvetica,Arial,sans-serif;font-size:14px;">${esc(label)}</td>
      <td align="right" style="padding:5px 0;color:#33402f;font-family:Georgia,serif;font-size:15px;">${esc(value)}</td>
    </tr>`;
}

function buildHtml(d) {
  const declining = d.attending === "Regretfully declines";
  const details = declining
    ? row("Attending", "Regretfully declines") + row("Your message", d.message)
    : row("Attending", "Joyfully accepts") +
      row("Guests", d.guests) +
      row("Joining you", d.guest_names) +
      row("Song request", d.song) +
      row("Your message", d.message);

  // Guests who can't make it don't need calendar or directions buttons.
  const eventBlock = declining
    ? ""
    : `
    <tr>
      <td style="padding:22px 30px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#1d3327;border-radius:10px;">
          <tr>
            <td align="center" style="padding:24px 20px;">
              <div style="color:#c9a24b;font-size:16px;letter-spacing:6px;padding-bottom:10px;">&#10086;</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#f3e7c8;padding-bottom:6px;">${EVENT_WHEN}</div>
              <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#e9d29a;padding-bottom:20px;">${EVENT_WHERE}</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="padding:0 5px 8px;">
                    <a href="${CAL_LINK}" target="_blank" style="display:inline-block;background-color:#c9a24b;color:#241c07;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:12px 22px;border-radius:999px;">Add to Calendar</a>
                  </td>
                  <td style="padding:0 5px 8px;">
                    <a href="${MAPS_LINK}" target="_blank" style="display:inline-block;border:1px solid #c9a24b;color:#e9d29a;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:11px 22px;border-radius:999px;">Get Directions</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  const intro = declining
    ? "Thank you for letting us know — we'll miss you, but we're so grateful you replied. Here's what we have on record:"
    : "Thank you for your RSVP — it means so much to us. Here's what we have on record:";

  return `<div style="margin:0;padding:0;background-color:#f9f5ec;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f9f5ec;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:#ffffff;border-radius:14px;overflow:hidden;">
        <tr>
          <td align="center" style="background-color:#1d3327;padding:36px 24px 30px;">
            <div style="font-size:13px;letter-spacing:4px;text-transform:uppercase;color:#e9d29a;font-family:Helvetica,Arial,sans-serif;">You're invited</div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:40px;line-height:1.2;color:#f3e7c8;padding:10px 0 4px;">Mannat <span style="color:#c9a24b;">&amp;</span> Sree</div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:16px;color:#e9d29a;">are getting engaged</div>
          </td>
        </tr>
        <tr><td style="padding:30px 30px 6px;font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#33402f;">Dear ${esc(d.name) || "friend"},</td></tr>
        <tr><td style="padding:0 30px 22px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#5a6553;">${intro}</td></tr>
        <tr>
          <td style="padding:0 30px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f9f5ec;border:1px solid #f1ead9;border-radius:10px;">
              <tr><td style="padding:18px 20px;">
                <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#6b7257;text-align:center;padding-bottom:14px;font-family:Helvetica,Arial,sans-serif;">Your RSVP</div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${details}</table>
              </td></tr>
            </table>
          </td>
        </tr>
        ${eventBlock}
        <tr><td align="center" style="padding:26px 30px 10px;font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#5a6553;">We can't wait to celebrate with you.</td></tr>
        <tr><td align="center" style="padding:0 30px 30px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;color:#6b7257;">With love,</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:27px;color:#6b7257;padding-top:4px;">Mannat <span style="color:#c9a24b;">&amp;</span> Sree</div>
        </td></tr>
        <tr><td align="center" style="background-color:#f9f5ec;border-top:1px solid #f1ead9;padding:16px 24px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#8a9182;">Need to change your RSVP? Just reply to this email.</td></tr>
      </table>
    </td></tr>
  </table>
</div>`;
}

function buildText(d) {
  const declining = d.attending === "Regretfully declines";
  const lines = [
    `Dear ${d.name || "friend"},`,
    ``,
    declining
      ? `Thank you for letting us know — we'll miss you, but we're grateful you replied.`
      : `Thank you for your RSVP! Here's what we have on record:`,
    ``,
    `  Attending:    ${declining ? "Regretfully declines" : "Joyfully accepts"}`,
  ];
  if (!declining) {
    lines.push(`  Guests:       ${d.guests || "1"}`);
    if (d.guest_names) lines.push(`  Joining you:  ${d.guest_names}`);
    if (d.song) lines.push(`  Song request: ${d.song}`);
  }
  if (d.message) lines.push(`  Your message: ${d.message}`);
  if (!declining) {
    lines.push(
      ``,
      `  When:  ${EVENT_WHEN}`,
      `  Where: ${EVENT_WHERE}`,
      ``,
      `Add to your calendar: ${CAL_LINK}`,
      `Directions: ${MAPS_LINK}`
    );
  }
  lines.push(``, `We can't wait to celebrate with you.`, ``, `With love,`, `Mannat & Sree`);
  return lines.join("\n");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, reason: "method_not_allowed" });
    return;
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    // Not configured yet — report it plainly rather than pretending to send.
    res.status(200).json({ ok: false, reason: "not_configured" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  if (!body || typeof body !== "object") {
    res.status(400).json({ ok: false, reason: "bad_request" });
    return;
  }

  const to = String(body.to || "").trim().slice(0, MAX);
  if (!EMAIL_RE.test(to)) {
    res.status(400).json({ ok: false, reason: "invalid_recipient" });
    return;
  }

  const data = {
    name: String(body.name || "").slice(0, MAX),
    attending: String(body.attending || "").slice(0, MAX),
    guests: String(body.guests || "").slice(0, MAX),
    guest_names: String(body.guest_names || "").slice(0, MAX),
    song: String(body.song || "").slice(0, MAX),
    message: String(body.message || "").slice(0, MAX),
  };

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Mannat & Sree" <${user}>`,
      to,
      replyTo: user,
      subject: "Your RSVP — Mannat & Sree's Engagement",
      text: buildText(data),
      html: buildHtml(data),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    // Never surface SMTP internals to the browser; the RSVP itself is
    // already safely delivered, so this failing is not guest-facing.
    console.error("confirm email failed:", err && err.message);
    res.status(200).json({ ok: false, reason: "send_failed" });
  }
};
