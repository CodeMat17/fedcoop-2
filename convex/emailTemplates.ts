/*
 * HTML email templates for Resend. Email clients ignore <style> blocks and modern CSS,
 * so everything is table layout with inline styles. Every user value goes through esc().
 */

const BRAND = "#0e4d3c";
const BRAND_SOFT = "#e4eee9";
const LINE = "#c7dad2";
const INK = "#101a17";
const MUTED = "#4b5b55";
const PAPER = "#f6f8f6";
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const CONTACT = {
  legalName: "Federal Civil Service Staff of Nigeria Cooperative Societies Union Limited",
  address: "Federal Secretariat Complex, Phase 1, Abuja, FCT, Nigeria",
  phone: "+234 (0) 916 248 4000",
  email: "email@fedcoop.org",
};

export const CATEGORY_LABELS: Record<string, string> = {
  membership: "Membership Enquiry",
  general: "General Enquiry",
  partnership: "Partnership",
  training: "Training",
  "peer-review": "Peer Review",
  investment: "Investment",
  directory: "Cooperative Directory",
  other: "Other",
};

export type EnquiryEmail = {
  category: string;
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  cooperativeName?: string;
  mda?: string;
  contactPerson?: string;
};

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const paragraphs = (s: string) => esc(s).replace(/\r?\n/g, "<br>");

function layout(preheader: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>FEDCOOP</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${LINE};border-radius:12px;overflow:hidden;">
      <tr><td style="background:${BRAND};padding:24px 32px;">
        <div style="font-family:${FONT};font-size:22px;font-weight:700;letter-spacing:0.08em;color:#ffffff;">FEDCOOP</div>
        <div style="font-family:${FONT};font-size:12px;color:${BRAND_SOFT};margin-top:4px;">Federal Civil Service Staff Cooperative Societies Union</div>
      </td></tr>
      <tr><td style="padding:32px;font-family:${FONT};color:${INK};font-size:15px;line-height:1.6;">
        ${body}
      </td></tr>
      <tr><td style="border-top:1px solid ${LINE};padding:20px 32px;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};">
        ${CONTACT.legalName}<br>${CONTACT.address}<br>${CONTACT.phone} · <a href="mailto:${CONTACT.email}" style="color:${MUTED};">${CONTACT.email}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function row(label: string, value: string, href?: string) {
  const v = href
    ? `<a href="${esc(href)}" style="color:${BRAND};text-decoration:underline;">${esc(value)}</a>`
    : esc(value);
  return `<tr>
  <td style="padding:10px 12px 10px 0;border-bottom:1px solid ${BRAND_SOFT};font-family:${FONT};font-size:13px;color:${MUTED};width:150px;vertical-align:top;">${esc(label)}</td>
  <td style="padding:10px 0;border-bottom:1px solid ${BRAND_SOFT};font-family:${FONT};font-size:15px;color:${INK};vertical-align:top;">${v}</td>
</tr>`;
}

/** Sent to the FEDCOOP inbox for every enquiry. */
export function enquiryNotification(e: EnquiryEmail) {
  const label = CATEGORY_LABELS[e.category] ?? e.category;
  const subject = `New ${label.toLowerCase()} from ${e.fullName}${e.subject ? `: ${e.subject}` : ""}`;
  const replyHref = `mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.subject || label}`)}`;

  const rows = [
    row("Name", e.fullName),
    row("Email", e.email, `mailto:${e.email}`),
    e.phone ? row("Phone", e.phone, `tel:${e.phone.replace(/[^\d+]/g, "")}`) : "",
    e.subject ? row("Subject", e.subject) : "",
    e.cooperativeName ? row("Cooperative society", e.cooperativeName) : "",
    e.mda ? row("MDA", e.mda) : "",
    e.contactPerson ? row("Contact person", e.contactPerson) : "",
  ].join("");

  const html = layout(
    `${e.fullName}: ${e.message.slice(0, 90)}`,
    `<span style="display:inline-block;background:${BRAND_SOFT};color:${BRAND};border:1px solid ${LINE};border-radius:999px;padding:4px 12px;font-size:12px;font-weight:600;">${esc(label)}</span>
    <h1 style="margin:16px 0 4px;font-size:22px;line-height:1.3;color:${INK};">New enquiry from ${esc(e.fullName)}</h1>
    <p style="margin:0 0 24px;color:${MUTED};font-size:14px;">Sent from the contact form on the FEDCOOP website.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    <div style="margin:28px 0 8px;font-size:13px;color:${MUTED};">Message</div>
    <div style="background:${PAPER};border-left:4px solid ${BRAND};border-radius:6px;padding:16px 20px;font-size:15px;line-height:1.7;color:${INK};">${paragraphs(e.message)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr>
      <td style="background:${BRAND};border-radius:8px;">
        <a href="${esc(replyHref)}" style="display:inline-block;padding:12px 24px;font-family:${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Reply to ${esc(e.fullName)}</a>
      </td>
    </tr></table>`,
  );

  const text = [
    `New ${label} from ${e.fullName}`,
    "",
    `Name: ${e.fullName}`,
    `Email: ${e.email}`,
    e.phone ? `Phone: ${e.phone}` : null,
    e.subject ? `Subject: ${e.subject}` : null,
    e.cooperativeName ? `Cooperative society: ${e.cooperativeName}` : null,
    e.mda ? `MDA: ${e.mda}` : null,
    e.contactPerson ? `Contact person: ${e.contactPerson}` : null,
    "",
    e.message,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return { subject, html, text };
}

/** Sent to the person who submitted the form. */
export function enquiryConfirmation(e: EnquiryEmail) {
  const label = CATEGORY_LABELS[e.category] ?? e.category;
  const subject = "We have received your enquiry";

  const html = layout(
    "FEDCOOP will reply within two working days.",
    `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${INK};">Thank you, ${esc(e.fullName)}</h1>
    <p style="margin:0 0 16px;">FEDCOOP has received your enquiry and will reply to <strong>${esc(e.email)}</strong> within two working days.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;">
      ${row("Enquiry type", label)}
      ${e.subject ? row("Subject", e.subject) : ""}
    </table>
    <div style="margin:24px 0 8px;font-size:13px;color:${MUTED};">Your message</div>
    <div style="background:${PAPER};border-left:4px solid ${BRAND};border-radius:6px;padding:16px 20px;font-size:15px;line-height:1.7;color:${INK};">${paragraphs(e.message)}</div>
    <p style="margin:24px 0 0;">If your enquiry is urgent, call us on <a href="tel:+2349162484000" style="color:${BRAND};">${CONTACT.phone}</a>, Monday to Friday, 8:00 to 16:00 WAT.</p>
    <p style="margin:24px 0 0;">FEDCOOP</p>`,
  );

  const text = `Dear ${e.fullName},\n\nFEDCOOP has received your enquiry (${label}) and will reply to ${e.email} within two working days.\n\nYour message:\n${e.message}\n\nIf your enquiry is urgent, call ${CONTACT.phone}, Monday to Friday, 8:00 to 16:00 WAT.\n\nFEDCOOP\n${CONTACT.address}`;

  return { subject, html, text };
}
