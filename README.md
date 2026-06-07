# Limra Courses — Azure Deployment

Production domain: https://limra.co.in

The app is a TanStack Start SSR application (server functions + SSR), so it
needs a Node runtime. Deploy to **Azure App Service (Node 20/22)** — not Azure
Static Web Apps.

## 1. Environment variables (App Service → Configuration)

Required:

- `VITE_SUPABASE_URL` — public Supabase URL (build-time)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — public anon key (build-time)
- `SUPABASE_URL` — same as above, runtime
- `SUPABASE_PUBLISHABLE_KEY` — same as VITE key, runtime
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only, NEVER expose)
- `NODE_ENV=production`
- `WEBSITES_PORT=8080` (Linux App Service) — nitro listens on `process.env.PORT`

The `VITE_*` vars must be present at **build time** (in GitHub Actions), the
others at **runtime** (App Service Configuration).

## 2. Build locally

```bash
npm install
NITRO_PRESET=node-server npm run build
npm start            # serves .output/server/index.mjs on PORT (default 3000)
```

The build produces a self-contained Node server in `dist/` (entry:
`dist/server/index.mjs`, static assets in `dist/client/`).

## 3. Deploy via GitHub Actions

Two workflows are pre-configured:

- `.github/workflows/main_limra.yml` → App Service `limra`
- `.github/workflows/main_limra-campus.yml` → App Service `limra-campus`

Each workflow:

1. Installs deps with `npm ci`
2. Builds with `NITRO_PRESET=node-server` (Node server output)
3. Packages `.output/`, `package.json`, and `web.config`
4. Deploys to Azure Web App via OIDC

App Service runs `npm start`, which executes `node .output/server/index.mjs`.

## 4. Azure App Service settings

- **Stack**: Node 20 LTS or 22 LTS
- **Startup command** (Linux): `npm start`
- **Always On**: enabled (recommended)
- **HTTPS Only**: enabled
- **Min TLS**: 1.2

Windows App Service uses the included `web.config` (iisnode). Linux ignores it
and uses the startup command above.

## 5. Custom domain (`limra.co.in`)

1. In Azure App Service → Custom domains → add `limra.co.in` and `www.limra.co.in`
2. Add the DNS records Azure shows (A + TXT, or CNAME for www)
3. Bind a free App Service Managed Certificate for both hostnames

## 6. SEO

- `robots.txt` includes host + sitemap
- `sitemap.xml` includes core public routes
- Root metadata sets canonical + `og:url` for `https://limra.co.in`
