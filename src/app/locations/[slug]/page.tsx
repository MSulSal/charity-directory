import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CharityCatalog } from "@/components/CharityCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  categories,
  getLocalResourceLocationBySlug,
  getLocalResourceLocations,
} from "@/data";
import { getBreadcrumbSchema, getLocationCollectionSchema } from "@/lib/seo";

interface LocationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getLocalResourceLocations().map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocalResourceLocationBySlug(slug);

  if (!location) {
    return { title: "Location Not Found" };
  }

  const place = `${location.city}, ${location.state}`;
  return {
    title: `${place} Food Banks, Charities & Local Help`,
    description: `Find source-linked food banks, charities, meal services, and local help in ${place}. Check each organization's official site for current services and eligibility.`,
    alternates: { canonical: `/locations/${location.slug}` },
    openGraph: {
      title: `${place} Food Banks, Charities & Local Help`,
      description: `Source-linked local help in ${place}, including food access and support services.`,
      url: `/locations/${location.slug}`,
    },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = getLocalResourceLocationBySlug(slug);
  if (!location) {
    notFound();
  }

  const place = `${location.city}, ${location.state}`;
  const path = `/locations/${location.slug}`;
  const schemas = [
    getLocationCollectionSchema({
      city: location.city,
      state: location.state,
      path,
      resourceCount: location.resources.length,
    }),
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Local Resources", path: "/resource-finder" },
      { name: place, path },
    ]),
  ].filter(Boolean) as Record<string, unknown>[];

  return (
    <>
      {schemas.length > 0 ? <JsonLd data={schemas} /> : null}
      <CharityCatalog
        charities={location.resources}
        categories={categories}
        title={`${place} Food Banks, Charities & Local Help`}
        description={`Explore ${location.resources.length} source-linked local resources in ${place}. Confirm hours, eligibility, and current services directly with each organization before visiting.`}
      />
    </>
  );
}
