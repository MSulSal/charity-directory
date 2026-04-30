import Link from "next/link";

const actions = [
  { label: "Donate", href: "/resource-finder?way=Donate" },
  { label: "Volunteer", href: "/resource-finder?way=Volunteer" },
  { label: "Get Help", href: "/resource-finder?way=Get+Help" },
  { label: "Donate Goods", href: "/resource-finder?way=Goods" },
  { label: "Find Local Charities", href: "/resource-finder?radius=25" },
];

export function AudienceActionChips() {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Quick actions">
      {actions.map((action) => (
        <li key={action.label}>
          <Link
            href={action.href}
            className="inline-flex border border-[var(--color-border)] bg-[rgb(22_17_31/72%)] px-3 py-2 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase transition hover:border-[var(--color-soft-amethyst)] hover:text-[var(--color-text-strong)]"
          >
            {action.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
