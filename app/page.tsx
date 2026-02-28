// Middleware redirects "/" to /dashboard (authenticated) or /auth/login (unauthenticated).
// This file exists only to satisfy Next.js's requirement for a root page.
export default function Home() {
  return null;
}
