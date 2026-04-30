import type { Metadata } from "next";

import { CategoryDropdownExplorer } from "@/components/CategoryDropdownExplorer";
import { categories, charities } from "@/data";

export const metadata: Metadata = {
  title: "Charity Categories",
  description:
    "Browse charity categories including food support, mental health, animal rescue, education, legal aid, and local nonprofit services.",
};

export default function CategoriesPage() {
  return (
    <CategoryDropdownExplorer
      categories={categories}
      charities={charities}
      title="Charity Categories"
      description="Find food charities near me, animal rescue charities, mental health charities, volunteer opportunities near me, and local nonprofits by selecting a category below."
    />
  );
}
