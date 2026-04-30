import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CharityCatalog } from "@/components/CharityCatalog";
import { categories, getCategoryBySlug, getCharitiesByCategory } from "@/data";
import { filtersFromSearchParams } from "@/lib/filters";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: category.name,
    description: `Browse ${category.name.toLowerCase()} charities, subcategories, local nonprofits, and donation opportunities.`,
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);

  const category = getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const charitiesInCategory = getCharitiesByCategory(category.slug);
  const initialFilters = filtersFromSearchParams(resolvedSearchParams);

  return (
    <>
      <section className="mx-auto w-full max-w-7xl space-y-6 px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
        <p className="text-xs tracking-[0.16em] text-[var(--color-text-faint)] uppercase">Category detail</p>
        <h1 className="font-semibold text-4xl leading-tight text-[var(--color-text-strong)] sm:text-5xl">
          {category.name}
        </h1>
        <p className="max-w-4xl text-sm leading-7 text-[var(--color-text-muted)]">{category.shortDescription}</p>

        <div className="dark-panel p-6">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text-strong)] uppercase">
            Subcategories
          </h2>
          <ul className="mt-4 grid gap-2 text-sm text-[var(--color-text-muted)] sm:grid-cols-2 lg:grid-cols-3">
            {category.subcategories.map((subcategory) => (
              <li key={subcategory}>
                <Link
                  href={{
                    pathname: `/categories/${category.slug}`,
                    query: { subcategory },
                  }}
                  className="inline-flex border-b border-[var(--color-border)] pb-0.5 transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
                >
                  {subcategory}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CharityCatalog
        charities={charitiesInCategory}
        categories={categories}
        initialFilters={initialFilters}
        title={`${category.name} Charities`}
        description="Filter by subcategory, location, ways to help, vetted status, service scope, and population served."
      />
    </>
  );
}
