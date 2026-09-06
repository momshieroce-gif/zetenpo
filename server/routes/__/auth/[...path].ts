import { getRequestURL, proxyRequest } from 'h3';

const FIREBASE_AUTH_ORIGIN = 'https://zetenpo-69c88.firebaseapp.com';

export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event);
  return proxyRequest(event, `${FIREBASE_AUTH_ORIGIN}${requestUrl.pathname}${requestUrl.search}`);
});