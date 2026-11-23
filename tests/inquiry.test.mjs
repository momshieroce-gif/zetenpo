import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

let saved;
let saveError;
let mailError;
let mail;
let config;

mock.module('firebase-admin/app', {
  namedExports: {
    getApps: () => [],
    initializeApp: () => ({}),
  },
});
mock.module('firebase-admin/firestore', {
  namedExports: {
    FieldValue: { serverTimestamp: () => 'server timestamp' },
    getFirestore: () => ({
      collection: (name) => {
        assert.equal(name, 'customerInquiries');
        return {
          add: async (data) => {
            if (saveError) throw saveError;
            saved = data;
          },
        };
      },
    }),
  },
});
mock.module('nodemailer', {
  defaultExport: {
    createTransport: () => ({
      sendMail: async (data) => {
        if (mailError) throw mailError;
        mail = data;
      },
    }),
  },
});

globalThis.defineEventHandler = (handler) => handler;
globalThis.readBody = async (event) => event.body;
globalThis.getRequestIP = (event) => event.ip;
globalThis.useRuntimeConfig = () => config;
globalThis.createError = ({ statusCode, statusMessage }) => Object.assign(new Error(statusMessage), { statusCode });

const { default: handler } = await import(pathToFileURL(resolve('server', 'api', 'inquiry.post.ts')).href);
const valid = {
  name: ' Jane Doe ', email: ' jane@example.com ', phone: '123', topic: 'Support',
  title: ' Need help ', message: ' Please help me ', website: '',
};
let ip = 0;
const submit = (body = valid) => handler({ body, ip: String(++ip) });
const reset = () => {
  saved = undefined;
  mail = undefined;
  saveError = undefined;
  mailError = undefined;
  config = { public: { firebaseProjectId: 'test-project' }, smtpHost: 'smtp.example.com', smtpPort: '587', inquiryTo: 'support@example.com' };
};

test('saves the inquiry and includes its title in the notification', async () => {
  reset();
  assert.deepEqual(await submit(), { ok: true, emailSent: true });
  assert.deepEqual(saved, {
    name: 'Jane Doe', email: 'jane@example.com', phone: '123', topic: 'Support',
    title: 'Need help', message: 'Please help me',
    createdAt: 'server timestamp', updatedAt: 'server timestamp',
  });
  assert.match(mail.subject, /Need help/);
  assert.match(mail.text, /Title: Need help/);
});

test('rejects invalid inquiries without saving', async () => {
  reset();
  await assert.rejects(submit({ ...valid, title: '  ' }), { statusCode: 400 });
  assert.equal(saved, undefined);
});

test('reports a save failure without sending email', async () => {
  reset();
  saveError = new Error('write failed');
  await assert.rejects(submit(), { statusCode: 503 });
  assert.equal(mail, undefined);
});

test('reports notification failures without losing the saved inquiry', async () => {
  reset();
  mailError = new Error('mail failed');
  assert.deepEqual(await submit(), { ok: true, emailSent: false });
  assert.equal(saved.email, 'jane@example.com');

  reset();
  config.smtpHost = '';
  assert.deepEqual(await submit(), { ok: true, emailSent: false });
  assert.equal(saved.title, 'Need help');
});

test('ignores honeypot submissions', async () => {
  reset();
  assert.deepEqual(await submit({ ...valid, website: 'bot' }), { ok: true, emailSent: true });
  assert.equal(saved, undefined);
});
