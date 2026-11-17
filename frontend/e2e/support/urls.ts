// The app under test: a production build served by `next start` (see playwright.config.ts).
export const APP_URL = 'http://127.0.0.1:5100';

// Nothing listens on these two. Every request to them is answered by the mock gateway's routes,
// and one it has no handler for fails the test rather than reaching anything real.
export const GATEWAY_URL = 'http://127.0.0.1:5199';
// Stands in for the R2 bucket: presigned avatar uploads, and every stored image.
export const R2_URL = 'http://127.0.0.1:5198';
