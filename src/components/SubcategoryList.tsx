interface SubcategoryListProps {
  subcategories: string[];
  maxItems?: number;
}

export function SubcategoryList({
  subcategories,
  maxItems = subcategories.length,
}: SubcategoryListProps) {
  return (
    <ul className="grid gap-2 text-sm text-[var(--color-text-muted)] sm:grid-cols-2">
      {subcategories.slice(0, maxItems).map((subcategory) => (
        <li key={subcategory} className="border-l border-[var(--color-border-soft)] pl-3 leading-6">
          {subcategory}
        </li>
      ))}
    </ul>
  );
}
