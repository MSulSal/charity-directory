# National Coverage Rollout

## Goal

Build a source-linked local-help directory city by city without scraping map results or relying on a provider that can introduce unexpected recurring fees.

## Publication Standard

Each published service location must have all of the following:

- Organization name and official organization or government source URL
- Full public address and valid latitude/longitude
- At least one current action or contact link
- Clear service classification, such as food pantry, meal program, shelter, legal aid, or health clinic
- Source date and a review date

Listings that do not meet this standard stay out of the public Resource Finder.

## Priority Method

Prioritize localities using three signals:

1. Housing and basic-needs severity using HUD Continuum of Care Point-in-Time data.
2. Number of people a city-level launch can reach.
3. Availability of official, reusable local government and organization sources.

HUD's 2024 Annual Homelessness Assessment Report provides the national, state, and Continuum of Care data used for the housing-need signal. Census ACS poverty data will be added to the score once a reproducible public extract is available in the project environment.

Source: https://www.huduser.gov/portal/datasets/ahar/2024-ahar-part-1-pit-estimates-of-homelessness-in-the-us.html
Source: https://www.census.gov/programs-surveys/acs/data/data-via-api.html

## Initial Queue

This is a working research and publication order, not a claim that these areas are the only places with need.

1. Chicago, Illinois - current validation market; expand from the existing source-linked records.
2. New York City, New York - food access, homelessness, immigration, and emergency-support coverage.
3. Los Angeles County, California - food access, homelessness, and housing-support coverage.
4. San Francisco Bay Area, California - housing, food access, and family-support coverage.
5. Seattle and King County, Washington - food access, housing, and behavioral-health coverage.
6. San Diego County, California - food access, shelter, and family-support coverage.
7. Phoenix and Maricopa County, Arizona - heat safety, food access, housing, and family-support coverage.
8. Philadelphia, Pennsylvania - food access, housing, legal aid, and family-support coverage.
9. Houston, Texas - food access, disaster recovery, housing, and health coverage.
10. Detroit, Michigan - food access, workforce, housing, and family-support coverage.
11. Baltimore, Maryland - food access, housing, legal aid, and health coverage.
12. New Orleans, Louisiana - food access, disaster recovery, housing, and health coverage.
13. Denver Metro, Colorado - food access, housing, behavioral-health, and newcomer-support coverage.
14. Washington, DC and Northern Virginia - food access, housing, legal aid, and family-support coverage.
15. Boston, Massachusetts - food access, housing, health, and immigrant-support coverage.

## Per-Locality Workflow

1. Gather candidate services only from official organization, city, county, or state sources with a clear reuse path.
2. Verify public contact information, action links, address, and service type against the source.
3. Geocode the verified public address with a source that permits the intended use, then visually confirm the pin.
4. Add records as source-linked local services, distinct from curated organization profiles when appropriate.
5. Run address, coordinate, duplicate, and link checks before publishing.
6. Recheck service availability and source links on a defined refresh schedule.

## Scaling Rule

The current local TypeScript dataset is suitable for the first carefully reviewed batches. Before publishing hundreds of location-level services, move the local-service records into a managed database with import logs, source licenses, review status, and automated freshness checks.
