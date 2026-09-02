# ThreatLyst Frontend Deployment

## Recommended topology

The recommended separation is:

- Frontend: `https://threatlyst.com`
- API: `https://api.threatlyst.com`
- Optional `www`: redirect `https://www.threatlyst.com` to the apex domain

These names are deployment recommendations, not assumptions that DNS or certificates already exist. Configure DNS and TLS with the selected hosting and API providers.

A same-origin topology is also supported. When `VITE_API_BASE_URL` is omitted from a production build, ThreatLyst uses the secure frontend origin. The edge server must then proxy `/api/*`, `/health`, and `/live` to FastAPI before applying the SPA fallback.

## Environment configuration

For a separate API domain, configure this build-time frontend variable:

```text
VITE_API_BASE_URL=https://api.threatlyst.com
```

Production rejects insecure HTTP API configuration and falls back only to a secure same-origin deployment. Both frontend and API must use HTTPS to avoid browser mixed-content blocking.

Configure the backend with explicit comma-separated allowlists:

```text
CORS_ALLOWED_ORIGINS=https://threatlyst.com,https://www.threatlyst.com
TRUSTED_HOSTS=api.threatlyst.com,127.0.0.1,localhost
```

Include `www` in CORS only when the application is actually served from that origin. If it only redirects to the apex, the apex origin is sufficient. Preserve any internal hostnames or loopback addresses used by reverse proxies and container health checks. Never use `*` for production browser origins.

No value above is a secret. Database credentials, JWT keys, and other backend secrets must remain in the deployment platform's secret store and must never use the `VITE_` prefix, because Vite variables are public in the browser bundle.

## Build and output

From `frontend/`:

```bash
npm ci
npm run build
```

Deploy `frontend/dist/`. Vite emits hashed static assets and keeps route-level feature chunks lazy. Production source maps are disabled by the current Vite defaults.

The frontend is designed for the root of its domain. Hosting it under a URL subpath would require an explicit Vite `base` and matching React Router basename and is not part of the current release configuration.

## SPA route fallback

The host must serve real files normally and internally rewrite all other frontend paths to `/index.html`. This is required for direct navigation and refreshes on `/dashboard`, `/events`, `/alerts`, and every other React Router route.

- Netlify and compatible Cloudflare Pages deployments can use the emitted `_redirects` file.
- Vercel can use the checked-in `vercel.json` rewrite.
- Nginx can use:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

For same-origin API proxying, define `/api/`, `/health`, and `/live` proxy locations before the frontend fallback.

## HTTPS, headers, and caching

TLS certificates and redirects belong at the hosting edge or reverse proxy, not in React. Redirect HTTP to HTTPS before serving the application.

Recommended static-host behavior:

- Serve `index.html` with revalidation or a short cache lifetime.
- Cache hashed files under `/assets/` for a long immutable lifetime.
- Set `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and a restrictive `frame-ancestors` policy.
- A CSP should allow connections to the selected API origin through `connect-src`.

ThreatLyst uses bundled scripts and styles, but some chart/UI positioning uses React-generated inline style attributes. Test CSP in report-only mode before enforcing it; a practical initial policy may require `style-src 'self' 'unsafe-inline'` while keeping `script-src 'self'`. Do not add `unsafe-eval` for production.

## Compatible hosting patterns

- Static frontend on Vercel, Netlify, or Cloudflare Pages with FastAPI hosted separately
- Static frontend behind Nginx with Nginx proxying to FastAPI
- Same-server Nginx static hosting plus a local FastAPI upstream
- Containerized static hosting using an Nginx or equivalent web-server image

No paid provider is required by the application architecture. Provider selection, DNS, certificates, secrets, deployment promotion, and monitoring remain deployment-time decisions.

## Release commands

```bash
npm run build
npm run lint
npm test
npm run format:check
```

After deployment, verify login, one authorized route for each role, a direct deep-link refresh, logout, an API-unreachable error state, `/health`, and `/live` over HTTPS.
