# Limra Courses Deployment

Production domain: https://limra.co.in

## 1. Environment variables

Set these variables in your hosting provider (Production environment):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

You can copy from `.env.example`.

## 2. Build and run locally

```bash
npm install
npm run build
npm run preview
```

## 3. Deploy

This project builds with Vite + TanStack Start.

- Build command: `npm run build`
- Output used by the app: `dist/`

Use your platform's Node deployment flow (Vercel/Netlify/Cloudflare/other), and ensure all env vars above are configured.

## 4. Domain setup (`limra.co.in`)

In your DNS provider, point the domain to your hosting platform:

- `@` root record: as required by your host (A/ALIAS/ANAME)
- `www` CNAME: point to the host-provided target (optional redirect to apex)

Then set primary domain in hosting dashboard to:

- `limra.co.in`

## 5. SEO files already set

- `robots.txt` includes host + sitemap
- `sitemap.xml` includes core public routes
- root metadata includes canonical + og:url for `https://limra.co.in`
