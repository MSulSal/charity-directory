# Charity Directory

Charity Directory is a source-linked charity discovery experience for donors, volunteers, companies, and people looking for support. The launch dataset contains only published organization records with direct action links and structured trust fields.

## Project Overview

The product direction is to feel closer to Google Maps / Yelp / Zocdoc / Airbnb-style discovery than a dense nonprofit spreadsheet.

The core user intent supported in this version:

> I want to help or find help for [who/what] with [type of need] in [place] by [way of helping].

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- React 19
- Tailwind CSS 4

## Run Locally

1. Install dependencies:

```bash
pnpm install
```

2. Start the dev server:

```bash
pnpm dev
```

3. Open:

- `http://localhost:3000`

### Production checks

```bash
pnpm lint
pnpm build
```

## Launch Configuration

Copy `.env.example` to `.env.local` and set all three values before deploying:

- `NEXT_PUBLIC_SITE_URL`: canonical public URL, without a trailing slash
- `NEXT_PUBLIC_CONTACT_EMAIL`: public inbox for contact and recommendation drafts

No map API key is required. Maps use Leaflet with CARTO map tiles. Resource Finder resolves covered city and ZIP locations from the published directory dataset; it does not send visitor address queries to a third-party geocoder.

## Current Features

- Premium homepage with:
  - Hero copy, trust messaging, and search fields for "Charity, cause, or need" + location
  - Main search routes to `/charities` for full charity result cards
  - Section flow: Hero -> Resource Finder -> Category Browser
  - Quick action chips: Donate, Volunteer, Get Help, Donate Goods, Find Local Charities, Apply / Recommend
- Resource Finder (map + radius search):
  - `/resource-finder`
  - Enter location and radius to find nearby charities
  - Filter by subcategory, ways to help, verified/listed, service scope, and population served
- Full-width Leaflet map panel with plotted published organization markers (no API key required)
  - Compact matched-organization list focused on map/routing context
- Charity search results:
  - `/charities`
  - Full card-based results for regular directory search
  - Filter by subcategory, location, ways to help, verified/listed, service scope, and population served
- Category browsing:
  - `/categories`
  - `/categories/[slug]`
  - Five major categories with expandable subcategory dropdowns
  - Subcategory expansion reveals detailed charity cards directly in the category explorer
- Charity profiles:
  - `/charities/[slug]`
  - Mission, category, subcategories, populations served, service area
  - Contact info, website, donation portal, donation FAQ, volunteer link
  - Verification/watchdog badges as structured fields
  - EIN, 501(c)(3) status field, Form 990 field
  - Social links, Leaflet location map, and related charities
- Apply / Recommend intake:
  - `/submit-a-charity`
  - Form supports both recommendation submissions and nonprofit apply/claim requests
  - Captures organization details, category, location, notes, and optional evidence links
  - Opens a pre-filled email draft to the configured directory inbox; the site does not retain submission details
- Reusable component architecture:
  - `Hero`, `SearchBar`, `AudienceActionChips`
  - `ResourceFinder`
  - `CategoryDropdownExplorer`, `CategoryCard`, `SubcategoryList`
  - `CharityCard`, `CharityProfile`
  - `VerificationBadges`, `MapPreview`
  - `FilterSidebar`
  - Shared `Layout` + `Header` + `Footer`
- SEO foundation:
  - Homepage metadata, canonical URL support, Open Graph image, sitemap, and robots route
  - Category and listing metadata targeting discovery queries such as:
    - food charities near me
    - animal rescue charities
    - mental health charities
    - volunteer opportunities near me
    - local nonprofits
    - donation opportunities

## Routes

- `/`
- `/resource-finder`
- `/categories`
- `/categories/[slug]`
- `/charities`
- `/charities/[slug]`

Also includes:

- `/about`
- `/for-nonprofits`
- `/submit-a-charity` (active apply/recommend form)
- `/contact`
- `/trust`
- `/privacy`

## Data and Trust Notes

- Only records marked as real organization records are published. Development-only sample records are excluded from every public route and search flow.
- No Charity Directory ratings are claimed. Watchdog and tax-status fields link to named sources when available.
- Confirm program availability, eligibility, service boundaries, and donation details directly with each organization. The directory is not an emergency, crisis, or legal-advice service.
- Before every content release, re-check every action link and update each record's `lastVerified` date.

## Future Roadmap

- Expand the verified organization dataset and formalize a source-refresh cadence
- Replace email-draft intake with a server-side reviewed submission workflow
- Add monitoring, automated link checks, and browser accessibility tests in CI
- Add richer geospatial coverage, map clustering, and authoritative program-availability data
