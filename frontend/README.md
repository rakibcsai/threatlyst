# ThreatLyst Frontend

ThreatLyst is the React-based Security Operations Platform interface for the ThreatLyst FastAPI backend.

## Local development

Requirements: Node.js 22 or later and npm.

```bash
npm ci
npm run dev
```

The default development API is `http://127.0.0.1:8000`. Override it in an ignored `.env.local` when needed:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Production build

Set an HTTPS API origin before building a cross-origin deployment:

```text
VITE_API_BASE_URL=https://api.threatlyst.com
```

```bash
npm ci
npm run build
```

Deploy the generated `dist/` directory. The host must rewrite frontend routes to `index.html` so React Router deep links and refreshes work.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for domain, HTTPS, CORS, SPA fallback, security-header, and hosting guidance.

## Quality checks

```bash
npm run build
npm run lint
npm test
npm run format:check
```
