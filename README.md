# Charity Directory

Charity Directory is a premium, modern discovery experience for charities and nonprofits. This initial release focuses on clear browsing, trust-oriented profile structure, and action-first calls to donate, volunteer, contact, and learn more.

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
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open:

- `http://localhost:3000`

### Production checks

```bash
npm run lint
npm run build
```

## Environment Variables

Optional map embed support:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

You can copy `.env.example` to `.env.local` and fill the value.

If the key is missing, charity profiles show a styled map placeholder plus a "View on Google Maps" external link.

## Current Features

- Premium homepage with:
  - Hero copy, trust messaging, and search fields for "Charity, cause, or need" + location
  - Quick action chips: Donate, Volunteer, Get Help, Donate Goods, Find Local Charities
- Category browsing:
  - `/categories`
  - `/categories/[slug]`
  - Five major categories with full subcategory lists
- Charity listing discovery:
  - `/charities`
  - Client-side filters for:
    - Subcategory
    - Location
    - Ways to help
    - Verified/vetted only
    - Local/National/International
    - Population served
- Charity profiles:
  - `/charities/[slug]`
  - Mission, category, subcategories, populations served, service area
  - Contact info, website, donation portal, donation FAQ, volunteer link
  - Verification/watchdog badges as structured fields
  - EIN, 501(c)(3) status field, Form 990 field
  - Social links, map preview, and related charities
- Reusable component architecture:
  - `Hero`, `SearchBar`, `AudienceActionChips`
  - `CategoryGrid`, `CategoryCard`, `SubcategoryList`
  - `CharityCard`, `CharityProfile`
  - `VerificationBadges`, `MapPreview`
  - `FilterSidebar`
  - Shared `Layout` + `Header` + `Footer`
- SEO foundation:
  - Homepage metadata
  - Category and listing metadata targeting discovery queries such as:
    - food charities near me
    - animal rescue charities
    - mental health charities
    - volunteer opportunities near me
    - local nonprofits
    - donation opportunities

## Routes

- `/`
- `/categories`
- `/categories/[slug]`
- `/charities`
- `/charities/[slug]`

Also includes placeholder utility pages linked in the footer:

- `/about`
- `/for-nonprofits`
- `/submit-a-charity`
- `/contact`

## Data Notes (Important)

- The dataset in this repo is **sample/mock data** only.
- No live watchdog ratings are claimed.
- Verification-related values are modeled as structured fields so real integrations can be added later (for example: Charity Navigator, Candid/GuideStar, IRS nonprofit status, BBB Wise Giving Alliance).

## Future Roadmap

- Real data ingestion pipeline for verified nonprofit records
- Profile claim/update workflows for nonprofits
- Stronger trust and audit trail UI (source timestamps, evidence links)
- Geospatial discovery enhancements (distance/radius and map clustering)
- User accounts and saved charities
- Organization comparison and recommendation experiences
- Accessibility audits and usability testing iterations
