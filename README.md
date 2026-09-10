# Aloe Vera Skin Renewal

Marketing website for an independent L'Bri Pure n' Natural consultant. The site introduces L'Bri's Aloe-First skincare philosophy, helps visitors find products for different skin types, and sends shoppers to the consultant's L'Bri catalog.

The project also includes an authenticated AI-SERP audit dashboard for reviewing a site's search visibility, SEO, AI context, and authority signals.

## Features

### Public website

- Responsive, single-page React landing page with mobile navigation
- Hero section focused on Aloe-First skincare
- Entity clarity section explaining the relationship between Aloe Vera Skin Renewal, the independent consultant, and L'Bri Pure n' Natural
- Educational sections covering:
  - What Aloe-First skincare means
  - Aloe versus water as the first ingredient
  - The L'Bri formulation and cold-stabilized aloe process
  - Scientific benefits and product-quality commitments
- Product group sections for:
  - Deep Pore Trio
  - Gentle Trio
  - Intense Body Care
- Skin-type guidance for oily, combination, sensitive, normal, dry, and mature skin
- Customer testimonials and social-proof content
- FAQ accordion with questions about sensitive skin, aloe processing, preservatives, results, comparisons, dry skin, and the L'Bri brand
- Newsletter signup form with client-side success/error toasts
- Links to the L'Bri affiliate catalog
- Responsive footer with contact, navigation, catalog, and social-link areas

### Admin AI-SERP auditor

The Express server exposes a password-protected `/admin` dashboard that can:

- Save the site URL and brand name used for an audit
- Crawl the configured site
- Analyze page content with an OpenAI-compatible API
- Produce scores for:
  - AI search visibility
  - SEO
  - AI context
  - Authority
- Generate suggested quick wins and technical fixes
- Review audit results and pending fixes
- Mark fixes as applied or rejected
- Persist audit results and configuration in local JSON files

## SEO and discoverability

- Semantic HTML and descriptive content for search engines and AI systems
- JSON-LD structured data for Organization, Brand, WebSite, LocalBusiness, Product, FAQPage, and WebPage entities
- Open Graph metadata for social sharing
- Google Analytics tag
- `robots.txt` with explicit crawler guidance, including AI crawlers
- XML sitemap at `/sitemap.xml`
- Canonical site references for `aloeveraskinrenewal.com`

## Tech stack

- React 18
- TypeScript
- Vite
- Express
- Wouter
- TanStack React Query
- Tailwind CSS
- shadcn/ui and Radix UI primitives
- Lucide and React Icons
- Drizzle ORM and Zod schemas
- Python AI-SERP auditor using `requests`, Beautiful Soup, and the OpenAI Python client

## Project structure

```text
client/
  public/             # favicon, robots.txt, and sitemap.xml
  src/
    components/ui/    # reusable UI components
    hooks/            # React hooks
    lib/              # query client and utilities
    pages/            # Home and not-found pages
server/
  index.ts            # Express entry point and Vite/static setup
  routes.ts           # admin and newsletter routes
  storage.ts          # storage interface and current in-memory implementation
  static.ts            # production static-file serving
shared/
  schema.ts           # shared Drizzle/Zod data schemas
script/
  build.ts            # production build script
ai_serp_auditor.py    # crawler, AI analyzer, and fix generation
dashboard.py          # standalone Flask version of the auditor dashboard
```

## Getting started

### Requirements

- Node.js 20 or newer
- npm
- Python 3.11 or newer if you want to run the AI-SERP auditor

### Install dependencies

```bash
npm install
```

The main web app runs with the Node dependencies in `package.json`. The Python auditor additionally expects:

```bash
pip install requests beautifulsoup4 openai
```

### Run the development server

```bash
npm run dev
```

The app listens on port `5000` by default. Set `PORT` to use another port.

### Build and run production output

```bash
npm run build
npm start
```

### Type-check the project

```bash
npm run check
```

### Database schema command

The repository includes Drizzle/PostgreSQL schema definitions and a schema push command:

```bash
npm run db:push
```

Set `DATABASE_URL` before using this command.

## Environment variables

### Public web app

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Port used by the Express server. Defaults to `5000`. |
| `SESSION_SECRET` | Recommended | Secret used to sign admin sessions. |
| `DASHBOARD_PASSWORD` | For `/admin` | Password required to access the AI-SERP dashboard. |

### AI-SERP auditor

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | For audits | OpenAI-compatible API key used by the Python analyzer. |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Alternative | Replit-compatible alternative to `OPENAI_API_KEY`. |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Optional | Custom OpenAI-compatible API base URL. |
| `DATABASE_URL` | Only for schema tooling | PostgreSQL connection string used by Drizzle tooling. |

Do not commit secrets to the repository. Use the environment's secret manager for local and deployed values.

## Routes

### Public routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | Public landing page |
| `POST` | `/api/newsletter` | Validate and save a newsletter email |

The newsletter endpoint returns `400` for invalid or duplicate email addresses and `500` for unexpected storage errors.

### Admin routes

All admin routes except the login page require an authenticated session.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/admin/login` | Admin login page |
| `POST` | `/admin/login` | Authenticate with `DASHBOARD_PASSWORD` |
| `GET` | `/admin` | Auditor dashboard |
| `POST` | `/admin/config` | Save site URL and brand name |
| `POST` | `/admin/audit` | Run a crawl and AI-SERP audit |
| `POST` | `/admin/fix/:fixId/apply` | Mark a suggested fix as applied |
| `POST` | `/admin/fix/:fixId/reject` | Reject a suggested fix |
| `GET` | `/admin/logout` | End the admin session |

## Data and persistence notes

The current runtime storage implementation is `MemStorage`, so newsletter subscribers and users held by the Node application are stored in memory and are lost when the process restarts. The Drizzle schema is present for a future PostgreSQL-backed implementation.

The auditor stores its local configuration and audit history in:

- `config.json`
- `audit_data.json`

These files are runtime data, not source code. Review your deployment's persistence behavior before relying on them for long-term audit history.

## Security notes

- Set a strong `SESSION_SECRET` in the environment.
- Set `DASHBOARD_PASSWORD` before exposing `/admin`.
- Keep `/admin` and `/api` excluded from crawler access as configured in `client/public/robots.txt`.
- Keep API keys in environment secrets and never place them in source files.

## License

This project is licensed under the MIT License.