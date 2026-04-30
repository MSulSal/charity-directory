import { CategoryCard } from "@/components/CategoryCard";
import type { Category } from "@/types/charity";

interface CategoryGridProps {
  categories: Category[];
  title?: string;
  description?: string;
  showAllSubcategories?: boolean;
}

export function CategoryGrid({
  categories,
  title,
  description,
  showAllSubcategories = false,
}: CategoryGridProps) {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
      {title ? (
        <div className="max-w-4xl space-y-3">
          <h2 className="font-semibold text-3xl leading-tight text-[var(--color-text-strong)] sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="text-sm leading-7 text-[var(--color-text-muted)]">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {categories.map((category) => (
          <CategoryCard
            key={category.slug}
            category={category}
            showAllSubcategories={showAllSubcategories}
          />
        ))}
      </div>
    </section>
  );
}
