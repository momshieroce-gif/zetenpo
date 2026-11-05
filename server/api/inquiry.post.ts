import nodemailer from 'nodemailer';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const hits = new Map<string, number[]>();

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event);
  const str = (k: string, max: number) => String(body?.[k] ?? '').trim().slice(0, max);

  // Honeypot: bots fill the hidden field
  if (str('website', 200)) return { ok: true };

  const name = str('name', 100);
  const email = str('email', 200);
  const phone = str('phone', 40);
  const topic = str('topic', 60) || 'General';
  const message = str('message', 3000);

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Please complete all required fields.' });
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 5) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' });
  }
  hits.set(ip, [...recent, now]);

  const c = useRuntimeConfig();
  if (!c.smtpHost || !c.inquiryTo) {
    throw createError({ statusCode: 503, statusMessage: 'Email is not configured yet.' });
  }

  const transporter = nodemailer.createTransport({
    host: c.smtpHost,
    port: Number(c.smtpPort),
    secure: Number(c.smtpPort) === 465,
    auth: c.smtpUser ? { user: c.smtpUser, pass: c.smtpPass } : undefined,
  });

  const safeName = name.replace(/[\r\n"]/g, ' ');
  try {
    await transporter.sendMail({
      from: c.inquiryFrom || c.smtpUser,
      to: c.inquiryTo,
      replyTo: `"${safeName}" <${email}>`,
      subject: `[My Near Shops] ${topic} inquiry from ${safeName}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nTopic: ${topic}\n\n${message}`,
      html: `<h2>New inquiry</h2><p><b>Name:</b> ${esc(name)}<br><b>Email:</b> ${esc(email)}<br><b>Phone:</b> ${esc(phone) || '-'}<br><b>Topic:</b> ${esc(topic)}</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
    });
  } catch (e) {
    console.error('Inquiry email failed', e);
    throw createError({ statusCode: 502, statusMessage: 'We could not send your message. Please try again.' });
  }
  return { ok: true };
});
