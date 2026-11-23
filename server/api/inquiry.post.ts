import nodemailer from 'nodemailer';
import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const hits = new Map<string, number[]>();

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event);
  const str = (k: string, max: number) => String(body?.[k] ?? '').trim().slice(0, max);

  // Honeypot: bots fill the hidden field
  if (str('website', 200)) return { ok: true, emailSent: true };

  const name = str('name', 100);
  const email = str('email', 200);
  const phone = str('phone', 40);
  const topic = str('topic', 60) || 'General';
  const title = str('title', 200);
  const message = str('message', 3000);

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !title || message.length < 10) {
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
  try {
    const app = getApps().find((item) => item.name === 'inquiries')
      || initializeApp({ projectId: c.public.firebaseProjectId || undefined }, 'inquiries');
    await getFirestore(app).collection('customerInquiries').add({
      name, email, phone, topic, title, message,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error('Inquiry Firestore save failed', e);
    throw createError({ statusCode: 503, statusMessage: 'We could not save your inquiry. Please try again.' });
  }

  if (!c.smtpHost || !c.inquiryTo) {
    console.error('Inquiry email is not configured');
    return { ok: true, emailSent: false };
  }

  const safeName = name.replace(/[\r\n"]/g, ' ');
  try {
    const transporter = nodemailer.createTransport({
      host: c.smtpHost,
      port: Number(c.smtpPort),
      secure: Number(c.smtpPort) === 465,
      auth: c.smtpUser ? { user: c.smtpUser, pass: c.smtpPass } : undefined,
    });
    await transporter.sendMail({
      from: c.inquiryFrom || c.smtpUser,
      to: c.inquiryTo,
      replyTo: `"${safeName}" <${email}>`,
      subject: `[My Near Shops] ${title.replace(/[\r\n]/g, ' ')} - ${topic} inquiry from ${safeName}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nTopic: ${topic}\nTitle: ${title}\n\n${message}`,
      html: `<h2>New inquiry</h2><p><b>Name:</b> ${esc(name)}<br><b>Email:</b> ${esc(email)}<br><b>Phone:</b> ${esc(phone) || '-'}<br><b>Topic:</b> ${esc(topic)}<br><b>Title:</b> ${esc(title)}</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
    });
  } catch (e) {
    console.error('Inquiry email failed', e);
    return { ok: true, emailSent: false };
  }
  return { ok: true, emailSent: true };
});
