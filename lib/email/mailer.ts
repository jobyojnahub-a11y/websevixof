import nodemailer from "nodemailer";

const host = process.env.EMAIL_HOST;
const port = Number(process.env.EMAIL_PORT || "587");
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;
const from = process.env.EMAIL_FROM || "WebSevix <no-reply@websevix.com>";

if (!host || !user || !pass) {
  // Don't crash app in dev/build; APIs will error if used without config.
  console.warn("Email config missing (EMAIL_HOST/EMAIL_USER/EMAIL_PASSWORD). Emails will fail.");
}

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  if (!host || !user || !pass) throw new Error("Email is not configured");
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

export function orderConfirmationEmail(params: {
  fullName: string;
  orderId: string;
  packageName: string;
  total: number;
}) {
  const { fullName, orderId, packageName, total } = params;
  return {
    subject: `Order confirmed - ${orderId}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Hi ${escapeHtml(fullName)},</h2>
        <p>Your order has been created successfully.</p>
        <p><b>Order:</b> ${escapeHtml(orderId)}<br/>
           <b>Package:</b> ${escapeHtml(packageName)}<br/>
           <b>Total Project Cost:</b> ₹${total.toLocaleString("en-IN")}
        </p>
        <p>You can track everything in your client dashboard.</p>
        <p>— WebSevix</p>
      </div>
    `,
  };
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

