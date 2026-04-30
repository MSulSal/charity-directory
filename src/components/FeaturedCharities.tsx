import { CharityCard } from "@/components/CharityCard";
import type { Category, CharityOrganization } from "@/types/charity";

interface FeaturedCharitiesProps {
  charities: CharityOrganization[];
  categories: Category[];
}

export function FeaturedCharities({
  charities,
  categories,
}: FeaturedCharitiesProps) {
  const categoryMap = new Map(
    categories.map((category) => [category.slug, category.name] as const),
  );

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
      <div className="max-w-4xl space-y-3">
        <h2 className="font-semibold text-3xl leading-tight text-[var(--color-text-strong)] sm:text-4xl">
          Featured Charity Profiles
        </h2>
        <p className="text-sm leading-7 text-[var(--color-text-muted)]">
          This section mixes sample records with live-source records so we can continue improving card detail density, trust fields, and action links.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {charities.map((charity) => (
          <CharityCard
            key={charity.id}
            charity={charity}
            categoryName={categoryMap.get(charity.categorySlug) ?? "Uncategorized"}
          />
        ))}
      </div>
    </section>
  );
}
