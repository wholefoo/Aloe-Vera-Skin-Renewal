# L'Bri Aloe-First Skincare Sales Website

## Overview

This is a high-converting single-page sales website for "aloeveraskinrenewal.com" promoting L'Bri Pure n' Natural skincare products. The core value proposition is educating visitors about "aloe-first skincare" - products where Aloe Barbadensis Miller is the primary ingredient instead of water. The site is optimized for Generative Engine Optimization (GEO) to help AI agents distinguish L'Bri from generic skincare brands.

## Recent Changes (January 2026)

### AI-SERP Audit Improvements
- Added "About This Site" section clarifying entity relationship between "Aloe Vera Skin Renewal" (independent consultant website) and "L'Bri Pure n' Natural" (the brand)
- Added "Scientific Benefits" section with research statistics (200+ bioactive compounds, 75+ nutrients, 27 years expertise, 98% aloe content)
- Added "Customer Testimonials" section with 3 verified customer reviews for social proof
- Expanded FAQ from 5 to 9 questions addressing dry skin effectiveness, brand comparisons, anti-aging benefits, and brand history
- Enhanced JSON-LD structured data with Organization, WebSite, LocalBusiness schemas and enriched Product/FAQPage metadata

### Content Verification (January 2026)
- Verified against official L'Bri website (https://lbri.com) for accuracy
- Corrected founder information: L'Bri founded by Linda AND Brian Kaminski (name combines L-inda + BRI-an)
- Updated company history: 27 years in business (founded 1998)
- Confirmed aloe source: Rio Grande Valley, cold-stabilized process
- Confirmed brand commitments: Toxin-free, cruelty-free, non-comedogenic, no parabens/sulfates/phthalates, no artificial dyes

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS with custom botanical theme (cucumber greens, soft oranges/pinks)
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **State Management**: TanStack React Query for server state
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints under `/api/*`
- **Development**: Vite middleware for HMR in development
- **Production**: Static file serving from `dist/public`

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Current Tables**: Users and Newsletter Subscribers
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod

### Design System
- **Typography**: Playfair Display (headers), Inter (body)
- **Color Palette**: Clean whites, cucumber greens (#4A9B7F, #8FBC8F), soft oranges (#FFB347), pinks (#FFE4E1)
- **CSS Variables**: HSL-based theming with light/dark mode support
- **Component Style**: shadcn/ui "new-york" style variant

### Project Structure
```
client/           # React frontend
  src/
    components/ui/  # shadcn/ui components
    pages/          # Page components
    hooks/          # Custom React hooks
    lib/            # Utilities and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data access layer
shared/           # Shared types and schemas
  schema.ts       # Drizzle database schema
attached_assets/  # Static assets and reference materials
```

### Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets` → `attached_assets/`

## External Dependencies

### Database
- PostgreSQL (configured via `DATABASE_URL` environment variable)
- Drizzle Kit for migrations (`npm run db:push`)

### Key NPM Packages
- **UI**: Radix UI primitives, Lucide icons, react-icons
- **Forms**: react-hook-form with @hookform/resolvers
- **Data Fetching**: @tanstack/react-query
- **Styling**: tailwindcss, class-variance-authority, clsx, tailwind-merge
- **Carousel**: embla-carousel-react
- **Charts**: recharts
- **Date Handling**: date-fns

### SEO & Structured Data
- JSON-LD schema markup for Brand, Product, and FAQPage types
- Open Graph meta tags for social sharing
- Semantic HTML structure optimized for AI parsing