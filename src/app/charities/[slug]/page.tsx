import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CharityProfile } from "@/components/CharityProfile";
import {
  charities,
  getCategoryBySlug,
  getCharityBySlug,
  getRelatedCharities,
} from "@/data";

interface CharityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return charities.map((charity) => ({ slug: charity.slug }));
}

export async function generateMetadata({ params }: CharityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const charity = getCharityBySlug(slug);

  if (!charity) {
    return { title: "Charity Not Found" };
  }

  return {
    title: charity.name,
    description: `${charity.name} profile with mission, location, donation fields, volunteer options, and trust metadata.`,
  };
}

export default async function CharityProfilePage({ params }: CharityPageProps) {
  const { slug } = await params;
  const charity = getCharityBySlug(slug);

  if (!charity) {
    notFound();
  }

  const category = getCategoryBySlug(charity.categorySlug);
  if (!category) {
    notFound();
  }

  const related = getRelatedCharities(charity, 3);

  return (
    <CharityProfile charity={charity} category={category} relatedCharities={related} />
  );
}
