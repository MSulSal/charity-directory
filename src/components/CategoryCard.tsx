import Link from "next/link";

import { SubcategoryList } from "@/components/SubcategoryList";
import type { Category } from "@/types/charity";

interface CategoryCardProps {
  category: Category;
  showAllSubcategories?: boolean;
}

export function CategoryCard({
  category,
  showAllSubcategories = false,
}: CategoryCardProps) {
  return (
    <article className="dark-panel flex h-full flex-col gap-5 p-6">
      <p className="text-xs tracking-[0.15em] text-[var(--color-royal-aubergine)] uppercase">
        {category.iconLabel}
      </p>

      <div className="space-y-3">
        <h3 className="font-semibold text-2xl leading-tight text-[var(--color-text-strong)]">
          {category.name}
        </h3>
        <p className="text-sm leading-7 text-[var(--color-text-muted)]">{category.shortDescription}</p>
      </div>

      <SubcategoryList
        subcategories={category.subcategories}
        maxItems={showAllSubcategories ? category.subcategories.length : 8}
      />

      <div className="mt-auto pt-2">
        <Link
          href={`/categories/${category.slug}`}
          className="inline-flex border-b border-[var(--color-border)] pb-1 text-sm font-medium text-[var(--color-text-strong)] transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-soft-amethyst)]"
        >
          Explore category
        </Link>
      </div>
    </article>
  );
}
