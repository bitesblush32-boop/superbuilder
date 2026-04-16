// Root route delegate — Turbopack resolves this file first in dev.
// Re-export content from app/(marketing)/page.tsx so both files
// serve the same landing page. Route config must be declared inline.
export const revalidate = 3600
export { default, metadata } from './(marketing)/page'
